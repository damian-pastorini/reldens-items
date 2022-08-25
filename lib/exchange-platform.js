/**
 *
 * Reldens - Items System - ExchangePlatform
 *
 */

const { EventsManagerSingleton, ErrorManager, Logger, sc } = require('@reldens/utils');
const ExchangeRequirement = require('../lib/exchange-requirement');
const ItemsEvents = require('../lib/items-events');

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
        this.events.emit(ItemsEvents.EXCHANGE.CANCELED, {exchangePlatform: this});
    }

    async pushForExchange(itemKey, qty, inventoryKey)
    {
        if(!this.isValidForPush(itemKey, qty, inventoryKey)){
            this.events.emit(ItemsEvents.EXCHANGE.INVALID_PUSH, {exchangePlatform: this, itemKey, qty, inventoryKey});
            return;
        }
        this.exchangeBetween[inventoryKey][itemKey] = qty;
        this.events.emit(ItemsEvents.EXCHANGE.ITEM_PUSHED, {exchangePlatform: this, itemKey, qty, inventoryKey});
    }

    async removeFromExchange(itemKey, inventoryKey)
    {
        this.events.emit(ItemsEvents.EXCHANGE.ITEM_REMOVE, {exchangePlatform: this, itemKey, inventoryKey});
        if(!sc.hasOwn(this.exchangeBetween[inventoryKey], itemKey)){
            return;
        }
        delete this.exchangeBetween[inventoryKey][itemKey];
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

    addRequirement(inventoryKey, itemKey, requiredItemKey, requiredQuantity)
    {
        this.exchangeRequirements[inventoryKey][itemKey] = new ExchangeRequirement({
            itemKey,
            requiredItemKey,
            requiredQuantity
        });
    }

    removeRequirement(inventoryKey, itemKey)
    {
        delete this.exchangeRequirements[inventoryKey][itemKey];
    }

    isValidForPush(itemKey, qty, inventoryKey)
    {
        // inventory has the item:
        if(!sc.hasOwn(this.inventories[inventoryKey].items, itemKey)){
            return false;
        }
        // item qty is available or -1 item qty is infinite:
        let pushedItem = this.inventories[inventoryKey].items[itemKey];
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
            let requirement = this.fetchRequirementByItemUid(inventoryItem.uid, requirements);
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

    fetchRequirementByItemUid(itemUid, requirements)
    {
        if(0 === requirements.length){
            return false;
        }
        for(let requirement of requirements){
            if(requirement.itemKey === itemUid){
                return requirement;
            }
        }
        return false;
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
            this.exchangeBetween = {A: {}, B: {}};
            return this.inventories;
        }
        let inventoryFrom = this.inventories[from];
        let inventoryTo = this.inventories[to];
        let itemsFromAKeys = Object.keys(this.exchangeBetween[from]);
        let requirements = this.exchangeRequirements[from];
        for(let itemKey of itemsFromAKeys){
            let itemQtyFrom = this.exchangeBetween[from][itemKey];
            if(0 === itemQtyFrom){
                Logger.error('Invalid item quantity 0.', itemKey, from, this.exchangeBetween[from]);
                continue;
            }
            let inventoryItem = this.inventories[from].items[itemKey];
            // first create the new item because the decrease qty could remove the instance we need to clone:
            let newItemFor = inventoryTo.createItemInstance(inventoryFrom.items[itemKey].key, itemQtyFrom);
            let requirement = this.fetchRequirementByItemUid(inventoryItem.uid, requirements);
            // @NOTE: since we already validate the transaction requirements before execute it, here we only need to
            // remove the requirements that were not pushed for exchange.
            let requirementWasPushedForExchange = sc.get(this.exchangeBetween[to], requirement.requiredItemKey, false);
            if(requirement && requirement.autoRemoveRequirement && false === requirementWasPushedForExchange){
                // we get the required item from the inventory from which will be removed:
                let requiredInventoryToItem = this.inventories[to].findItemByKey(requirement.requiredItemKey);
                if(false === requiredInventoryToItem){
                    Logger.error('The required item not longer exists.', itemKey, requirement.requiredItemKey);
                    continue;
                }
                // before remove the item, we need to create the instance for the inventory that required the item:
                let newItemFrom = inventoryFrom.createItemInstance(
                    requirement.requiredItemKey,
                    requirement.requiredQuantity
                );
                // decrease the required quantity and the item could end up removed:
                let modifyResult = await inventoryTo.decreaseItemQty(
                    requiredInventoryToItem.uid,
                    requirement.requiredQuantity
                );
                // if there was an error decreasing the quantity then continue with the other items (stop the process):
                if(false === modifyResult){
                    Logger.error(
                        'There was an error while decreasing the required item quantity.',
                        requirement,
                        requiredInventoryToItem
                    );
                    continue;
                }
                // for last, we must add that removed quantity on the inventory that required it:
                await inventoryFrom.addItem(newItemFrom);
            }
            let modifyResult = await inventoryFrom.decreaseItemQty(itemKey, itemQtyFrom);
            if(false !== modifyResult){
                await inventoryTo.addItem(newItemFor);
            }
        }
        this.exchangeBetween[from] = {};
        return this.inventories;
    }

    oppositeKey(inventoryKey)
    {
        return 'A' === inventoryKey ? 'B' : 'A';
    }

}

module.exports = ExchangePlatform;