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
        // get the opposite inventory key:
        let inventoryKeyTo = this.oppositeKey(inventoryKeyFrom);
        // loop over the requirements:
        for(let requirement of requirements){
            // check if the item with the requirement was pushed for exchange:
            let itemForExchange = sc.get(this.exchangeBetween[inventoryKeyFrom], requirement.itemKey, false);
            // if the item with requirement was not pushed for exchange then continue with the other requirements:
            if(false === itemForExchange){
                continue;
            }
            // if the item was pushed for exchange then we need to check if the required item was pushed for exchange:
            let requiredItemForExchange = this.findRequiredItemByKey(requirement.requiredItemKey, inventoryKeyTo);
            // if the required item is not available then the operation is invalid:
            if(false === requiredItemForExchange){
                this.lastErrorMessage = 'Required item "'+requirement.requiredItemKey+'"'
                    +' is not present on inventory '+'"'+inventoryKeyFrom+'".';
                return false;
            }
            // if the required item was pushed for exchange then check if the required quantity is available:
            if(requirement.requiredQuantity > requiredItemForExchange.qty){
                this.lastErrorMessage = 'Required item '+requirement.requiredItemKey
                    +' quantity ('+requirement.requiredQuantity+') is not available on inventory '
                    +'"'+inventoryKeyFrom+'".';
                return false;
            }
        }
        // if none requirement returned false then the operation is valid:
        return true;
    }

    async executeExchangeFromTo(from, to)
    {
        if(from === to){
            Logger.error('Inventories "FROM" and "TO" are the same, exchange cancelled.');
            this.exchangeBetween = {A: {}, B: {}};
            return this.inventories;
        }
        let inventoryFrom = this.inventories[from];
        let itemsFromAKeys = Object.keys(this.exchangeBetween[from]);
        for(let itemKey of itemsFromAKeys){
            let itemQtyFrom = this.exchangeBetween[from][itemKey] || 1;
            let newItemFor = this.inventories[to].createItemInstance(inventoryFrom.items[itemKey].key, itemQtyFrom);
            let modifyResult = await inventoryFrom.decreaseItemQty(itemKey, itemQtyFrom);
            if(false !== modifyResult){
                await this.inventories[to].addItem(newItemFor);
            }
        }
        this.exchangeBetween[from] = {};
        return this.inventories;
    }

    findRequiredItemByKey(key, inventoryKeyTo)
    {
        let itemsToExchangeListKeys = Object.keys(this.exchangeBetween[inventoryKeyTo]);
        if(0 === itemsToExchangeListKeys.length){
            return false;
        }
        for(let i of itemsToExchangeListKeys){
            let item = sc.get(this.inventories[inventoryKeyTo].items, i, false);
            if(item && item.key === key){
                return item;
            }
        }
        return false;
    }

    oppositeKey(inventoryKey)
    {
        return 'A' === inventoryKey ? 'B' : 'A';
    }

}

module.exports = ExchangePlatform;