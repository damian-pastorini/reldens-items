/**
 *
 * Reldens - Items System - RewardsProcessor
 *
 */

const { sc, Logger} = require('@reldens/utils');

class RewardsProcessor
{

    constructor(props)
    {
        this.rewardsByItemUid = sc.get(props, 'rewardsByItemUid', true);
        this.rewardsByItemKey = sc.get(props, 'rewardsByItemKey', false);
    }

    validateRewards(inventoryKeyFrom, exchange)
    {
        // if current inventory does not have any rewards, then the transaction is valid:
        let rewards = exchange.exchangeRewards[inventoryKeyFrom];
        if(0 === rewards.length){
            return true;
        }
        // if the inventory does not have any items pushed for exchange then the transaction is valid because it will
        // not require any rewards:
        let pushedForExchangeItems = exchange.exchangeBetween[inventoryKeyFrom];
        let pushedForExchangeItemsKeys = Object.keys(pushedForExchangeItems);
        if(0 === pushedForExchangeItemsKeys.length){
            return true;
        }
        // get the opposite inventory key:
        let inventoryKeyTo = exchange.oppositeKey(inventoryKeyFrom);
        // loop on the pushed for exchange items:
        for(let i of pushedForExchangeItemsKeys){
            // get the item from the current inventory:
            let inventoryItem = exchange.inventories[inventoryKeyFrom].items[i];
            // if the pushed for exchange item, requires a reward and the reward was marked with
            // "rewardItemIsRequired = false" then we can continue with the other items:
            let itemRewards = this.fetchItemRewards(rewards, inventoryItem);
            if(!this.rewardsValidation(itemRewards, inventoryKeyTo, exchange)){
                return false;
            }
        }
        return true;
    }

    fetchItemRewards(rewards, inventoryItem)
    {
        let itemRewards = [];
        if(this.rewardsByItemUid){
            itemRewards = [...itemRewards, ...rewards.fetchAllBy('itemUid', inventoryItem.uid)];
        }
        if(this.rewardsByItemKey){
            itemRewards = [...itemRewards, ...rewards.fetchAllBy('itemKey', inventoryItem.key)];
        }
        return itemRewards;
    }

    rewardsValidation(itemRewards, inventoryKeyTo, exchange)
    {
        if(0 === itemRewards.length){
            // if the item does not have any rewards then continue with the other items:
            return true;
        }
        for(let reward of itemRewards){
            if(false === reward.rewardItemIsRequired){
                continue;
            }
            // if the pushed for exchange item, requires a reward and the reward was marked with
            // "rewardItemIsRequired = true" and the item does not exist in the opposite inventory or the quantity
            // is not enough, then the transaction is invalid:
            let rewardInventoryItem = exchange.inventories[inventoryKeyTo].findItemByKey(reward.rewardItemKey);
            if(false === rewardInventoryItem){
                exchange.lastErrorMessage = this.rewardItemNotPresent(reward.rewardItemKey, inventoryKeyTo);
                return false;
            }
            if(reward.rewardQuantity > rewardInventoryItem.qty){
                return false
            }
        }
        return true;
    }

    rewardItemNotPresent(requiredItemKey, inventoryKey)
    {
        return 'Reward item "'+requiredItemKey+'"'+' is not present on inventory '+'"'+inventoryKey+'".';
    }

    async processRewards(from, to, itemUid, inventoryFrom, inventoryTo, exchange)
    {
        // if current inventory does not have any rewards, then the transaction is valid:
        let rewards = exchange.exchangeRewards[from];
        if(0 === rewards.length){
            return true;
        }
        // if the inventory does not have any items pushed for exchange then the transaction is valid because it will
        // not require any rewards:
        let pushedForExchangeItems = exchange.exchangeBetween[from];
        let pushedForExchangeItemsKeys = Object.keys(pushedForExchangeItems);
        if(0 === pushedForExchangeItemsKeys.length){
            return true;
        }
        // get the opposite inventory key:
        let inventoryKeyTo = exchange.oppositeKey(from);
        // loop on the pushed for exchange items:
        for(let i of pushedForExchangeItemsKeys){
            let pushedForExchangeItemQty = pushedForExchangeItems[i];
            // get the item from the current inventory:
            let inventoryItem = exchange.inventories[from].items[i];
            // if the pushed for exchange item, requires a reward and the reward was marked with
            // "rewardItemIsRequired = false" then we can create the reward and include it in the inventory:
            let reward = sc.fetchByProperty(rewards, 'itemKey', inventoryItem.key);
            if(false === reward.rewardItemIsRequired){
                // create the item, add it to the inventory and continue with the next pushed item:
                let newRewardItem = inventoryFrom.createItemInstance(
                    reward.rewardItemKey,
                    reward.rewardQuantity * pushedForExchangeItemQty
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
            let rewardInventoryItem = exchange.inventories[inventoryKeyTo].findItemByKey(reward.rewardItemKey);
            if(false === rewardInventoryItem){
                exchange.lastErrorMessage = this.rewardItemNotPresent(reward.rewardItemKey, inventoryKeyTo);
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
                rewardInventoryToItem.key,
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

}

module.exports = RewardsProcessor;
