/**
 *
 * Reldens - Items System - RequirementsProcessor
 *
 */

const { Logger, sc } = require('@reldens/utils');

class RequirementsProcessor
{

    constructor(props)
    {
        this.requirementsByItemUid = sc.get(props, 'requirementsByItemUid', true);
        this.requirementsByItemKey = sc.get(props, 'requirementsByItemKey', true);
        this.requirementsTotals = {};
    }

    validateRequirements(inventoryKeyFrom, exchange)
    {
        // if inventory from does not have any requirements then the transaction is valid:
        let requirements = exchange.exchangeRequirements[inventoryKeyFrom];
        if(0 === requirements.count()){
            return true;
        }
        // if the current validated inventory does not have any items pushed for exchange then the transaction is valid
        // because non items will match any requirement:
        let pushedForExchangeItems = exchange.exchangeBetween[inventoryKeyFrom];
        let pushedForExchangeItemsKeys = Object.keys(pushedForExchangeItems);
        if(0 === pushedForExchangeItemsKeys.length){
            return true;
        }
        // reset totals:
        this.requirementsTotals = {};
        // get the opposite inventory key:
        let inventoryKeyTo = exchange.oppositeKey(inventoryKeyFrom);
        // loop over the items pushed for exchange (these are the ones that could match the requirements):
        for(let i of pushedForExchangeItemsKeys){
            let pushedQuantity = pushedForExchangeItems[i];
            // get the item from the current inventory:
            let inventoryFrom = exchange.inventories[inventoryKeyFrom];
            let inventoryItem = sc.get(inventoryFrom.items, i, sc.get(inventoryFrom.frozenItems, i, false));
            if(false === inventoryItem){
                exchange.lastErrorMessage = 'Reward error, item "'+i+'" does not exits on inventory'
                    +' "'+inventoryKeyFrom+'".';
                return false;
            }
            let itemRequirements = this.fetchItemRequirements(requirements, inventoryItem);
            // if the item does not have any requirements then continue:
            if(0 === itemRequirements.length){
                continue;
            }
            this.plusRequirementsQuantity(itemRequirements, pushedQuantity);
            if(!this.validateItemRequirements(itemRequirements, pushedForExchangeItems[i], inventoryKeyTo, exchange)){
                return false;
            }
        }
        // if none requirement returned false then the operation is valid:
        return true;
    }

    fetchItemRequirements(requirements, inventoryItem)
    {
        let itemRequirements = [];
        if(this.requirementsByItemUid){
            itemRequirements = [...itemRequirements, ...requirements.fetchAllBy('itemUid', inventoryItem.uid)];
        }
        if(this.requirementsByItemKey){
            itemRequirements = [...itemRequirements, ...requirements.fetchAllBy('itemKey', inventoryItem.key)];
        }
        return itemRequirements;
    }

    plusRequirementsQuantity(itemRequirements, pushedQuantity)
    {
        // @NOTE: we can't reset the requirement totals here because we need the total requirements for all the pushed
        // items.
        for(let requirement of itemRequirements){
            if(!sc.hasOwn(this.requirementsTotals, requirement.requiredItemKey)){
                this.requirementsTotals[requirement.requiredItemKey] = 0;
            }
            this.requirementsTotals[requirement.requiredItemKey] += (requirement.requiredQuantity * pushedQuantity);
        }
    }

    validateItemRequirements(itemRequirements, pushedForExchangeItemQty, inventoryKeyTo, exchange)
    {
        if(0 === itemRequirements.length){
            // if the item does not have any requirements then continue with the other items:
            return true;
        }
        for(let requirement of itemRequirements){
            // get the required item from the opposite inventory:
            let requiredInventoryItem = exchange.inventories[inventoryKeyTo].findItemByKey(requirement.requiredItemKey);
            // if the required item is not present at all then the transaction is invalid:
            if(false === requiredInventoryItem){
                exchange.lastErrorMessage = this.requiredItemNotPresent(requirement.requiredItemKey, inventoryKeyTo);
                return false;
            }
            // if the required quantity multiplied by the pushed for exchange quantity is not enough we return false:
            let totalRequiredQuantity = requirement.requiredQuantity * pushedForExchangeItemQty;
            if(totalRequiredQuantity > requiredInventoryItem.qty){
                exchange.lastErrorMessage = this.requiredItemQuantityNotAvailable(
                    requirement,
                    totalRequiredQuantity,
                    inventoryKeyTo
                );
                return false;
            }
            // if the requirement can be automatically removed then continue because we already validate the quantity:
            if(true === requirement.autoRemoveRequirement){
                continue;
            }
            // if the requirement do not allow auto-remove then we check if the required item was pushed for exchange:
            let requiredItemForExchange = sc.get(
                exchange.exchangeBetween[inventoryKeyTo],
                requiredInventoryItem.uid,
                false
            );
            // if the items was not pushed for exchange and can not be automatically removed, then the transaction
            // is invalid:
            if(false === requiredItemForExchange && false === requirement.autoRemoveRequirement){
                exchange.lastErrorMessage = this.requiredItemNotPushedForExchange(
                    requirement.requiredItemKey,
                    inventoryKeyTo
                );
                return false;
            }
            // if the item was pushed for exchange then check the pushed quantity, if is not enough then the
            // transaction is invalid:
            if(totalRequiredQuantity > requiredItemForExchange){
                exchange.lastErrorMessage = this.requiredItemQuantityWasNotPushed(requirement, totalRequiredQuantity);
                return false;
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

    requiredItemQuantityNotAvailable(requirement, totalRequiredQuantity, inventoryKey)
    {
        return 'Required item '+requirement.requiredItemKey
            +' required quantity ('+totalRequiredQuantity+') is not available on inventory '
            +'"'+inventoryKey+'".';
    }

    requiredItemQuantityWasNotPushed(requirement, totalRequiredQuantity)
    {
        return 'Required item '+requirement.requiredItemKey
            +' required quantity ('+totalRequiredQuantity+') was not pushed for exchange.';
    }

    async processRequirements(from, to, itemUid, pushedForExchangeItemQty, inventoryFrom, inventoryTo, exchange)
    {
        let inventoryItem = sc.get(inventoryFrom.items, itemUid, sc.get(inventoryFrom.frozenItems, itemUid, false));
        if(false === inventoryItem){
            exchange.lastErrorMessage = 'Requirement error, item "'+itemUid+'" does not exits on inventory.';
            return false;
        }
        let requirements = exchange.exchangeRequirements[from];
        if(!requirements || 0 === requirements.count()){
            return true;
        }
        let itemRequirements = this.fetchItemRequirements(requirements, inventoryItem);
        if(0 === itemRequirements.length){
            return true;
        }
        for(let requirement of itemRequirements){
            let requirementPushedForExchange = sc.get(exchange.exchangeBetween[to], requirement.requiredItemKey, false);
            if(false === requirementPushedForExchange && false === requirement.autoRemoveRequirement){
                // the requirement was not pushed for exchange and cannot be auto removed:
                return false;
            }
            // we get the required item from the inventory from which will be removed:
            let requiredInventoryToItem = inventoryTo.findItemByKey(requirement.requiredItemKey);
            if(false === requiredInventoryToItem){
                Logger.error('The required item not longer exists.', itemUid, requirement.requiredItemKey);
                return false;
            }
            // get the proper total:
            let totalQuantity = requirement.requiredQuantity * pushedForExchangeItemQty;
            // @NOTE: before remove the item, we need to create the instance for the inventory that required the item,
            // we will only do it if the required item should be added to the inventory. This won't be the case on
            // NPCs where we don't care about adding items on the NPC that won't store the item.
            let newItemFrom = false === inventoryTo.dropExchange
                ? inventoryFrom.createItemInstance(requirement.requiredItemKey, totalQuantity)
                : false;
            // decrease the required quantity and the item could end up removed:
            inventoryTo.frozenItems[requiredInventoryToItem.uid] = Object.assign({}, requiredInventoryToItem);
            let inventoryToDecreaseItemQtyResult = await inventoryTo.decreaseItemQty(
                requiredInventoryToItem.uid,
                totalQuantity
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
            if(false !== newItemFrom){
                let itemInstances = !sc.isArray(newItemFrom) ? [newItemFrom] : newItemFrom;
                let addResult = await inventoryTo.addItems(itemInstances);
                if(false === addResult){
                    exchange.lastErrorMessage = '' !== inventoryTo.lastErrorMessage
                        ? 'Requirements process error. '+inventoryTo.lastErrorMessage
                        : 'Requirement add item error.';
                    Logger.error(exchange.lastErrorMessage);
                    return false;
                }
            }
        }
        return true;
    }
}

module.exports = RequirementsProcessor;