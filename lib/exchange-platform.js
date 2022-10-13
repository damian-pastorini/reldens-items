/**
 *
 * Reldens - Items System - ExchangePlatform
 *
 */

const ExchangeRequirement = require('../lib/exchange-requirement');
const ExchangeReward = require('../lib/exchange-reward');
const ItemsEvents = require('../lib/items-events');
const { EventsManagerSingleton, ErrorManager, Logger, sc } = require('@reldens/utils');

class ExchangePlatform
{
    constructor(props)
    {
        this.events = sc.get(props, 'eventsManager', EventsManagerSingleton);
    }

    initializeExchangeBetween(props)
    {
        let inventoryA = sc.get(props, 'inventoryA', null);
        let inventoryB = sc.get(props, 'inventoryB', null);
        if(null === inventoryA || null === inventoryB){
            ErrorManager.error('Missing inventories from properties.', props);
        }
        this.inventories = {A: inventoryA, B: inventoryB};
        this.lockInventories();
        this.confirmations = {A: false, B: false};
        this.exchangeBetween = {A: {}, B: {}};
        this.exchangeRequirements = {
            A: sc.get(props, 'exchangeRequirementsA', []),
            B: sc.get(props, 'exchangeRequirementsB', [])
        };
        this.exchangeRewards = {
            A: sc.get(props, 'exchangeRewardsA', []),
            B: sc.get(props, 'exchangeRewardsB', [])
        };
        this.dropExchange = {
            A: sc.get(props, 'dropExchangeA', false),
            B: sc.get(props, 'dropExchangeB', false)
        };
        this.lastErrorMessage = '';
        this.events.emit(ItemsEvents.EXCHANGE.INITIALIZED, {exchangePlatform: this, props, inventoryA, inventoryB});
    }

    cancelExchange()
    {
        this.inventories['A'].locked = false;
        this.inventories['B'].locked = false;
        this.inventories = {A: null, B: null};
        this.confirmations = {A: false, B: false};
        this.exchangeBetween = {A: {}, B: {}};
        this.exchangeRequirements = {A: [], B: []};
        this.exchangeRewards = {A: [], B: []};
        this.events.emit(ItemsEvents.EXCHANGE.CANCELED, {exchangePlatform: this});
    }

    async pushForExchange(itemUid, qty, inventoryKey)
    {
        if(!this.isValidForPush(itemUid, qty, inventoryKey)){
            this.events.emit(ItemsEvents.EXCHANGE.INVALID_PUSH, {exchangePlatform: this, itemUid, qty, inventoryKey});
            return;
        }
        this.exchangeBetween[inventoryKey][itemUid] = qty;
        this.events.emit(ItemsEvents.EXCHANGE.ITEM_PUSHED, {exchangePlatform: this, itemUid, qty, inventoryKey});
    }

    async removeFromExchange(itemUid, inventoryKey)
    {
        this.events.emit(ItemsEvents.EXCHANGE.ITEM_REMOVE, {exchangePlatform: this, itemUid, inventoryKey});
        if(!sc.hasOwn(this.exchangeBetween[inventoryKey], itemUid)){
            return;
        }
        delete this.exchangeBetween[inventoryKey][itemUid];
    }

    async confirmExchange(inventoryKey)
    {
        this.events.emit(ItemsEvents.EXCHANGE.CONFIRM, {exchangePlatform: this, inventoryKey});
        this.confirmations[inventoryKey] = true;
    }

    async finalizeExchange()
    {
        this.events.emit(ItemsEvents.EXCHANGE.BEFORE_FINALIZE, {exchangePlatform: this});
        if(!this.confirmations['A'] || !this.confirmations['B']){
            let errorOnA = !this.confirmations['A'] ? ' - A = false' : '';
            let errorOnB = !this.confirmations['B'] ? ' - B = false' : '';
            this.lastErrorMessage = 'Missing confirmation.'+errorOnA+errorOnB;
            return false;
        }
        if(!this.validateRequirements('A') || !this.validateRequirements('B')){
            return false;
        }
        if(!this.validateRewards('A') || !this.validateRewards('B')){
            return false;
        }
        this.unlockInventories();
        await this.executeExchangeFromTo('A', 'B');
        await this.executeExchangeFromTo('B', 'A');
        this.events.emit(ItemsEvents.EXCHANGE.FINALIZED, {exchangePlatform: this});
        return this.inventories;
    }

    lockInventories()
    {
        this.setLocks(true);
    }

    unlockInventories()
    {
        this.setLocks(false);
    }

    setLocks(status)
    {
        this.setInventoryLock('A', status);
        this.setInventoryLock('B', status);
    }

    setInventoryLock(inventoryKey, status)
    {
        this.inventories[inventoryKey].locked = status;
    }

    addRequirement(inventoryKey, itemUid, requiredItemKey, requiredQuantity, autoRemoveRequirement)
    {
        this.exchangeRequirements[inventoryKey][itemUid] = new ExchangeRequirement({
            itemUid,
            requiredItemKey,
            requiredQuantity,
            autoRemoveRequirement
        });
    }

    removeRequirement(inventoryKey, itemUid)
    {
        delete this.exchangeRequirements[inventoryKey][itemUid];
    }

    addReward(inventoryKey, itemUid, rewardItemKey, rewardQuantity, rewardItemIsRequired)
    {
        this.exchangeRewards[inventoryKey][itemUid] = new ExchangeReward({
            itemUid,
            rewardItemKey,
            rewardQuantity,
            rewardItemIsRequired
        });
    }

    removeReward(inventoryKey, itemUid)
    {
        delete this.exchangeRewards[inventoryKey][itemUid];
    }

    isValidForPush(itemUid, qty, inventoryKey)
    {
        // inventory has the item:
        if(!sc.hasOwn(this.inventories[inventoryKey].items, itemUid)){
            return false;
        }
        // item qty is available or -1 item qty is infinite:
        let pushedItem = this.inventories[inventoryKey].items[itemUid];
        return qty <= pushedItem.qty || -1 === pushedItem.qty;
    }

    validateRequirements(inventoryKeyFrom)
    {
        // if inventory from does not have any requirements then the transaction is valid:
        let requirements = this.exchangeRequirements[inventoryKeyFrom];
        if(0 === requirements.length){
            return true;
        }
        // if the current validated inventory does not have any items pushed for exchange then the transaction is valid
        // because non items will match any requirement:
        let pushedForExchangeItems = this.exchangeBetween[inventoryKeyFrom];
        let pushedForExchangeItemsKeys = Object.keys(pushedForExchangeItems);
        if(0 === pushedForExchangeItemsKeys.length){
            return true;
        }
        // get the opposite inventory key:
        let inventoryKeyTo = this.oppositeKey(inventoryKeyFrom);
        // loop over the items pushed for exchange (these are the ones that could match the requirements):
        for(let i of pushedForExchangeItemsKeys){
            // get the item from the current inventory:
            let inventoryItem = this.inventories[inventoryKeyFrom].items[i];
            let requirement = sc.fetchByProperty(requirements, 'itemUid', inventoryItem.uid);
            // if the item does not have any requirements then continue with the other items:
            if(false === requirement){
                continue;
            }
            // get the required item from the opposite inventory:
            let requiredInventoryItem = this.inventories[inventoryKeyTo].findItemByKey(requirement.requiredItemKey);
            // if the required item is not present at all then the transaction is invalid:
            if(false === requiredInventoryItem){
                this.lastErrorMessage = this.requiredItemNotPresent(requirement.requiredItemKey, inventoryKeyTo);
                return false;
            }
            // if the requirement allows auto-remove and the quantity is enough we can continue with the other items:
            if(requirement.autoRemoveRequirement && requirement.requiredQuantity < requiredInventoryItem.qty){
                continue;
            }
            // if the requirement do not allow auto-remove then we check if the required item was pushed for exchange:
            let requiredItemForExchange = sc.get(
                this.exchangeBetween[inventoryKeyTo],
                requiredInventoryItem.uid,
                false
            );
            // if the items was not pushed for exchange then the transaction is invalid:
            if(false === requiredItemForExchange){
                this.lastErrorMessage = this.requiredItemNotPushedForExchange(
                    requirement.requiredItemKey,
                    inventoryKeyTo
                );
                return false;
            }
            // if the item was pushed for exchange then check the pushed quantity, if is not enough then the
            // transaction is invalid:
            if(requirement.requiredQuantity > requiredItemForExchange){
                this.lastErrorMessage = this.requiredItemQuantityNotAvailable(requirement, inventoryKeyTo);
                return false;
            }
        }
        // if none requirement returned false then the operation is valid:
        return true;
    }

    validateRewards(inventoryKeyFrom)
    {
        // if current inventory does not have any rewards, then the transaction is valid:
        let rewards = this.exchangeRewards[inventoryKeyFrom];
        if(0 === rewards.length){
            return true;
        }
        // if the inventory does not have any items pushed for exchange then the transaction is valid because it will
        // not require any rewards:
        let pushedForExchangeItems = this.exchangeBetween[inventoryKeyFrom];
        let pushedForExchangeItemsKeys = Object.keys(pushedForExchangeItems);
        if(0 === pushedForExchangeItemsKeys.length){
            return true;
        }
        // get the opposite inventory key:
        let inventoryKeyTo = this.oppositeKey(inventoryKeyFrom);
        // loop on the pushed for exchange items:
        for(let i of pushedForExchangeItemsKeys){
            // get the item from the current inventory:
            let inventoryItem = this.inventories[inventoryKeyFrom].items[i];
            // if the pushed for exchange item, requires a reward and the reward was marked with
            // "rewardItemIsRequired = false" then we can continue with the other items:
            let reward = sc.fetchByProperty(rewards, 'itemUid', inventoryItem.uid);
            if(false === reward.rewardItemIsRequired){
                continue;
            }
            // if the pushed for exchange item, requires a reward and the reward was marked with
            // "rewardItemIsRequired = true" and the item does not exist in the opposite inventory or the quantity is
            // not enough, then the transaction is invalid:
            let rewardInventoryItem = this.inventories[inventoryKeyTo].findItemByKey(reward.rewardItemKey);
            if(false === rewardInventoryItem){
                this.lastErrorMessage = this.requiredItemNotPresent(reward.rewardItemKey, inventoryKeyTo);
                return false;
            }
            if(reward.rewardQuantity > rewardInventoryItem.qty){
                return false
            }
        }
        return true;
    }

    requiredItemNotPushedForExchange(requiredItemKey, inventoryKey)
    {
        return 'Required item "'+requiredItemKey+'"'+' was not pushed for exchange '+'"'+inventoryKey+'".';
    }

    requiredItemNotPresent(requiredItemKey, inventoryKey)
    {
        return 'Required item "'+requiredItemKey+'"'+' is not present on inventory '+'"'+inventoryKey+'".';
    }

    requiredItemQuantityNotAvailable(requirement, inventoryKey)
    {
        return 'Required item '+requirement.requiredItemKey
           +' required quantity ('+requirement.requiredQuantity+') is not available on inventory '
           +'"'+inventoryKey+'".';
    }

    async executeExchangeFromTo(from, to)
    {
        if(from === to){
            Logger.error('Inventories "FROM" and "TO" are the same, exchange cancelled.');
            this.cancelExchange();
            return this.inventories;
        }
        let inventoryFrom = this.inventories[from];
        let inventoryTo = this.inventories[to];
        let itemsFromAUids = Object.keys(this.exchangeBetween[from]);
        for(let itemUid of itemsFromAUids){
            let itemQtyFrom = this.exchangeBetween[from][itemUid];
            if(0 === itemQtyFrom){
                Logger.error('Invalid item quantity 0.', itemUid, from, this.exchangeBetween[from]);
                continue;
            }
            // first create the new item because the decrease quantity could remove the instance we need to clone:
            let newItemFor = inventoryTo.createItemInstance(inventoryFrom.items[itemUid].key, itemQtyFrom);
            // @NOTE: since we already validate the transaction requirements before execute it, here we only need to
            // remove the requirements that were not pushed for exchange.
            let requirementResult = await this.processRequirements(from, to, itemUid, inventoryFrom, inventoryTo);
            if(false === requirementResult){
                continue;
            }
            let rewardResult = await this.processRewards(from, to, itemUid, inventoryFrom, inventoryTo);
            if(false === rewardResult){
                continue;
            }
            let inventoryFromDecreaseItemQtyResult = await inventoryFrom.decreaseItemQty(itemUid, itemQtyFrom);
            // @NOTE: drop exchange is for when only care about giving rewards for items, for example selling an item,
            // if the seller is an NPC it won't need to add the sold item from the player to its own inventory.
            if(false !== inventoryFromDecreaseItemQtyResult && false === this.dropExchange[to]){
                console.log('adding item', itemUid);
                await inventoryTo.addItem(newItemFor);
            }
        }
        this.exchangeBetween[from] = {};
        return this.inventories;
    }

    async processRequirements(from, to, itemUid, inventoryFrom, inventoryTo)
    {
        let inventoryItem = inventoryFrom.items[itemUid];
        if(!inventoryItem){
            return true;
        }
        let requirements = this.exchangeRequirements[from];
        if(!requirements){
            return true;
        }
        let requirement = sc.fetchByProperty(requirements, 'itemUid', inventoryItem.uid);
        if(!requirement || !requirement.autoRemoveRequirement){
            return true;
        }
        let requirementPushedForExchange = sc.get(this.exchangeBetween[to], requirement.requiredItemKey, false);
        if(false !== requirementPushedForExchange){
            return true;
        }
        // we get the required item from the inventory from which will be removed:
        let requiredInventoryToItem = inventoryTo.findItemByKey(requirement.requiredItemKey);
        if(false === requiredInventoryToItem){
            Logger.error('The required item not longer exists.', itemUid, requirement.requiredItemKey);
            return false;
        }
        // before remove the item, we need to create the instance for the inventory that required the item:
        let newItemFrom = inventoryFrom.createItemInstance(
            requirement.requiredItemKey,
            requirement.requiredQuantity
        );
        // decrease the required quantity and the item could end up removed:
        let inventoryToDecreaseItemQtyResult = await inventoryTo.decreaseItemQty(
            requiredInventoryToItem.uid,
            requirement.requiredQuantity
        );
        // if there was an error decreasing the quantity then continue with the other items (stop the process):
        if(false === inventoryToDecreaseItemQtyResult){
            Logger.error(
                'There was an error while decreasing the required item quantity.',
                requirement,
                requiredInventoryToItem
            );
            return false;
        }
        // for last, we must add that removed quantity on the inventory that required it:
        await inventoryFrom.addItem(newItemFrom);
        return true;
    }

    async processRewards(from, to, itemUid, inventoryFrom, inventoryTo)
    {
        // if current inventory does not have any rewards, then the transaction is valid:
        let rewards = this.exchangeRewards[from];
        if(0 === rewards.length){
            return true;
        }
        // if the inventory does not have any items pushed for exchange then the transaction is valid because it will
        // not require any rewards:
        let pushedForExchangeItems = this.exchangeBetween[from];
        let pushedForExchangeItemsKeys = Object.keys(pushedForExchangeItems);
        if(0 === pushedForExchangeItemsKeys.length){
            return true;
        }
        // get the opposite inventory key:
        let inventoryKeyTo = this.oppositeKey(from);
        // loop on the pushed for exchange items:
        for(let i of pushedForExchangeItemsKeys){
            // get the item from the current inventory:
            let inventoryItem = this.inventories[from].items[i];
            // if the pushed for exchange item, requires a reward and the reward was marked with
            // "rewardItemIsRequired = false" then we can create the reward and include it in the inventory:
            let reward = sc.fetchByProperty(rewards, 'itemUid', inventoryItem.uid);
            if(false === reward.rewardItemIsRequired){
                // create the item, add it to the inventory and continue with the next pushed item:
                let newRewardItem = inventoryFrom.createItemInstance(
                    reward.rewardItemKey,
                    reward.rewardQuantity
                );
                let result = await inventoryFrom.addItem(newRewardItem);
                if(false === result){
                    return false;
                }
                continue;
            }
            // if the pushed for exchange item, requires a reward and the reward was marked with
            // "rewardItemIsRequired = true" and the item does not exist in the opposite inventory or the quantity is
            // not enough, then the transaction is invalid:
            let rewardInventoryItem = this.inventories[inventoryKeyTo].findItemByKey(reward.rewardItemKey);
            if(false === rewardInventoryItem){
                this.lastErrorMessage = this.requiredItemNotPresent(reward.rewardItemKey, inventoryKeyTo);
                return false;
            }
            if(reward.rewardQuantity > rewardInventoryItem.qty){
                return false
            }
            // fetch the item from the "to" inventory, create a new instance with the required quantity, add it to the
            // inventory and decrease the origin inventory quantity:
            let rewardInventoryToItem = inventoryTo.findItemByKey(reward.rewardItemKey);
            if(false === rewardInventoryToItem){
                Logger.error('The required item not longer exists.', itemUid, reward.rewardItemKey);
                return false;
            }
            let newRewardItem = inventoryFrom.createItemInstance(
                reward.rewardItemKey,
                reward.rewardQuantity
            );
            let inventoryToDecreaseItemQtyResult = await inventoryTo.decreaseItemQty(
                rewardInventoryToItem.uid,
                reward.requiredQuantity
            );
            // if there was an error decreasing the quantity then continue with the other items (stop the process):
            if(false === inventoryToDecreaseItemQtyResult){
                Logger.error(
                    'There was an error while decreasing the reward item quantity.',
                    reward,
                    rewardInventoryToItem
                );
                return false;
            }
            // for last, we must add that removed quantity on the inventory that required it:
            await inventoryFrom.addItem(newRewardItem);
        }
        return true;
    }

    oppositeKey(inventoryKey)
    {
        return 'A' === inventoryKey ? 'B' : 'A';
    }

}

module.exports = ExchangePlatform;