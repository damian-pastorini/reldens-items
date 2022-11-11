/**
 *
 * Reldens - Items System - RewardsProcessor
 *
 */

const { Logger, sc } = require('@reldens/utils');

class RewardsProcessor
{

    constructor(props)
    {
        this.rewardsByItemUid = sc.get(props, 'rewardsByItemUid', true);
        this.rewardsByItemKey = sc.get(props, 'rewardsByItemKey', true);
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
            let inventoryItem = sc.get(exchange.inventories[inventoryKeyFrom].items, i, false);
            if(false === inventoryItem){
                exchange.lastErrorMessage = 'Item "'+i+'" does not exits on inventory "'+inventoryKeyFrom+'".';
                return false;
            }
            // if the pushed for exchange item, requires a reward and the reward was marked with
            // "rewardItemIsRequired = false" then we can continue with the other items:
            let itemRewards = this.fetchItemRewards(rewards, inventoryItem);
            if(!this.validateItemRewards(itemRewards, inventoryKeyTo, exchange)){
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

    validateItemRewards(itemRewards, inventoryKeyTo, exchange)
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
                exchange.lastErrorMessage = this.rewardItemQuantityNotAvailable(
                    reward.rewardItemKey,
                    reward.rewardQuantity,
                    inventoryKeyTo
                );
                return false
            }
        }
        return true;
    }

    rewardItemNotPresent(rewardItemKey, inventoryKey)
    {
        return 'Reward item "'+rewardItemKey+'"'+' is not present on inventory '+'"'+inventoryKey+'".';
    }

    rewardItemQuantityNotAvailable(rewardItemKey, rewardQuantity, inventoryKey)
    {
        return 'Reward item '+rewardItemKey
            +' reward quantity ('+rewardQuantity+') is not available on inventory '
            +'"'+inventoryKey+'".';
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
            let itemRewards = this.fetchItemRewards(rewards, inventoryItem);
            let processItemRewardsResult = await this.processItemRewards(
                itemRewards,
                inventoryFrom,
                inventoryTo,
                inventoryKeyTo,
                pushedForExchangeItemQty,
                itemUid,
                exchange
            );
            if(!processItemRewardsResult){
                return false;
            }
        }
        return true;
    }

    async processItemRewards(
        itemRewards,
        inventoryFrom,
        inventoryTo,
        inventoryKeyTo,
        pushedForExchangeItemQty,
        itemUid,
        exchange
    ) {
        if(0 === itemRewards.length){
            return true;
        }
        for(let reward of itemRewards){
            let rewardQuantityTotal = reward.rewardQuantity * pushedForExchangeItemQty;
            // if the pushed for exchange item, requires a reward and the reward was marked with
            // "rewardItemIsRequired = false" then we can create the reward and include it in the inventory:
            if(false === reward.rewardItemIsRequired){
                // create the item, add it to the inventory and continue with the next pushed item:
                let newRewardItem = inventoryFrom.createItemInstance(
                    reward.rewardItemKey,
                    rewardQuantityTotal
                );
                let addItems = sc.isArray(newRewardItem) ? newRewardItem : [newRewardItem];
                let result = await inventoryFrom.addItems(addItems);
                if(false === result){
                    if('' !== inventoryFrom.lastErrorMessage){
                        exchange.lastErrorMessage = inventoryFrom.lastErrorMessage;
                    }
                    if('' === exchange.lastErrorMessage){
                        exchange.lastErrorMessage = 'Could add items: '+Object.keys(addItems).join(',')+'.';
                        Logger.error(exchange.lastErrorMessage, addItems);
                    }
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
            if(rewardQuantityTotal > rewardInventoryItem.qty){
                exchange.lastErrorMessage = 'Reward quantity ('+rewardQuantityTotal+')'
                    +' is bigger than the available in the inventory ('+rewardInventoryItem.qty+').';
                return false
            }
            // fetch the item from the "to" inventory, create a new instance with the required quantity, add it to the
            // inventory and decrease the origin inventory quantity:
            let rewardInventoryToItem = inventoryTo.findItemByKey(reward.rewardItemKey);
            if(false === rewardInventoryToItem){
                Logger.error('The reward item not longer exists.', itemUid, reward.rewardItemKey);
                return false;
            }
            let newRewardItem = inventoryFrom.createItemInstance(reward.rewardItemKey, rewardQuantityTotal);
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
