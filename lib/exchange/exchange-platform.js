/**
 *
 * Reldens - Items System - ExchangePlatform
 *
 */

const RequirementsCollection = require('./requirements-collection');
const RewardsCollection = require('./rewards-collection');
const RequirementsProcessor = require('./requirements-processor');
const RewardsProcessor = require('./rewards-processor');
const ItemsEvents = require('../items-events');
const { EventsManagerSingleton, ErrorManager, Logger, sc } = require('@reldens/utils');

class ExchangePlatform
{
    constructor(props)
    {
        this.events = sc.get(props, 'eventsManager', EventsManagerSingleton);
        this.requirementsProcessor = new RequirementsProcessor();
        this.rewardsProcessor = new RewardsProcessor();
        this.exchangeInitializerId = sc.get(props, 'exchangeInitializerId', false);
        this.initializeProperties();
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
            A: sc.get(props, 'exchangeRequirementsA', new RequirementsCollection()),
            B: sc.get(props, 'exchangeRequirementsB', new RequirementsCollection())
        };
        this.exchangeRewards = {
            A: sc.get(props, 'exchangeRewardsA', new RewardsCollection()),
            B: sc.get(props, 'exchangeRewardsB', new RewardsCollection())
        };
        this.dropExchange = {
            A: sc.get(props, 'dropExchangeA', false),
            B: sc.get(props, 'dropExchangeB', false)
        };
        this.avoidExchangeDecrease = {
            A: sc.get(props, 'avoidExchangeDecreaseA', false),
            B: sc.get(props, 'avoidExchangeDecreaseB', false)
        };
        this.lastErrorMessage = '';
        this.events.emit(ItemsEvents.EXCHANGE.INITIALIZED, {exchangePlatform: this, props, inventoryA, inventoryB});
    }

    cancelExchange()
    {
        this.unlockInventories();
        this.initializeProperties();
        this.events.emit(ItemsEvents.EXCHANGE.CANCELED, {exchangePlatform: this});
    }

    initializeProperties()
    {
        this.inventories = {A: null, B: null};
        this.confirmations = {A: false, B: false};
        this.exchangeBetween = {A: {}, B: {}};
        this.exchangeRequirements = {A: [], B: []};
        this.exchangeRewards = {A: [], B: []};
    }

    async pushForExchange(itemUid, qty, inventoryKey)
    {
        if(this.confirmations['A'] || this.confirmations['B']){
            // @TODO - BETA - Make lock exchange configurable so confirmation will be auto-removed on exchange changes.
            Logger.info('Push for exchange "'+itemUid+'" was blocked.'
                +' Exchange for "'+inventoryKey+'" and owner "'+this.inventories[inventoryKey].owner_id+'"'
                +' was already confirmed.');
            return false;
        }
        if(!this.canBePushed(itemUid, qty, inventoryKey)){
            this.events.emit(ItemsEvents.EXCHANGE.INVALID_PUSH, {exchangePlatform: this, itemUid, qty, inventoryKey});
            return false;
        }
        this.exchangeBetween[inventoryKey][itemUid] = qty;
        if(
            !this.validateRequirements('A')
            || !this.validateRewards('A')
            || !this.validateRequirements('B')
            || !this.validateRewards('B')
        ){
            delete this.exchangeBetween[inventoryKey][itemUid];
            return false;
        }
        this.events.emit(ItemsEvents.EXCHANGE.ITEM_PUSHED, {exchangePlatform: this, itemUid, qty, inventoryKey});
        return true;
    }

    async removeFromExchange(itemUid, inventoryKey)
    {
        if(this.confirmations['A'] || this.confirmations['B']){
            Logger.info('Remove from exchange "'+itemUid+'" was blocked.'
                +' Exchange for "'+inventoryKey+'" and owner "'+this.inventories[inventoryKey].owner_id +'"'
                +' was already confirmed.');
            return false;
        }
        this.events.emit(ItemsEvents.EXCHANGE.ITEM_REMOVE, {exchangePlatform: this, itemUid, inventoryKey});
        if(!sc.hasOwn(this.exchangeBetween[inventoryKey], itemUid)){
            return false;
        }
        delete this.exchangeBetween[inventoryKey][itemUid];
        return true;
    }

    async confirmExchange(inventoryKey)
    {
        this.events.emit(ItemsEvents.EXCHANGE.CONFIRM, {exchangePlatform: this, inventoryKey});
        this.confirmations[inventoryKey] = true;
    }

    async disconfirmExchange(inventoryKey)
    {
        this.events.emit(ItemsEvents.EXCHANGE.DISCONFIRM, {exchangePlatform: this, inventoryKey});
        this.confirmations[inventoryKey] = false;
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
        let resultA = await this.executeExchangeFromTo('A', 'B');
        if(false === resultA){
            return false;
        }
        let resultB = await this.executeExchangeFromTo('B', 'A');
        if(false === resultB){
            return false;
        }
        this.events.emit(ItemsEvents.EXCHANGE.FINALIZED, {exchangePlatform: this});
        this.lastErrorMessage = '';
        return true;
    }

    validateRequirements(inventoryKey)
    {
        return this.requirementsProcessor.validateRequirements(inventoryKey, this);
    }

    validateRewards(inventoryKey)
    {
        return this.rewardsProcessor.validateRewards(inventoryKey, this);
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
        let inventory = sc.get(this.inventories, inventoryKey, false);
        if(null === inventory){
            return false;
        }
        if(false === inventory){
            Logger.error('Inventory not found "'+inventoryKey+'".', this.inventories);
            return false;
        }
        inventory.locked = status;
        return true;
    }

    canBePushed(itemUid, qty, inventoryKey)
    {
        if(!sc.hasOwn(this.inventories[inventoryKey].items, itemUid)){
            Logger.critical('Item Key does not exists on the inventory', itemUid, this.inventories[inventoryKey].items);
            return false;
        }
        // item qty is available or -1 item qty is infinite:
        let pushedItem = this.inventories[inventoryKey].items[itemUid];
        let isValidQuantity = qty <= pushedItem.qty || -1 === pushedItem.qty;
        if(!isValidQuantity){
            this.lastErrorMessage = 'Invalid item pushed quantity ('+qty+'), available: '+pushedItem.qty;
        }
        return isValidQuantity;
    }

    async executeExchangeFromTo(from, to)
    {
        if(from === to){
            this.lastErrorMessage = 'Inventories "FROM" and "TO" are the same, exchange cancelled.';
            this.cancelExchange();
            return this.inventories;
        }
        let inventoryFrom = this.inventories[from];
        let inventoryTo = this.inventories[to];
        let itemsFromAUids = Object.keys(this.exchangeBetween[from]);
        for(let itemUid of itemsFromAUids){
            let itemQtyFrom = this.exchangeBetween[from][itemUid];
            if(0 === itemQtyFrom){
                this.lastErrorMessage = 'Invalid item quantity 0.';
                return false;
            }
            // first create the new item because the decrease quantity could remove the instance we need to clone:
            let newItemFor = false === this.dropExchange[to]
                ? inventoryTo.createItemInstance(inventoryFrom.items[itemUid].key, itemQtyFrom)
                : false;
            let rewardsResult = await this.rewardsProcessor.processRewards(
                from,
                to,
                itemUid,
                inventoryFrom,
                inventoryTo,
                this
            );
            if(false === rewardsResult){
                return false;
            }
            // @NOTE: since we already validate the transaction requirements before execute it, here we only need to
            // remove the requirements that were not pushed for exchange.
            let requirementsResult = await this.requirementsProcessor.processRequirements(
                from,
                to,
                itemUid,
                itemQtyFrom,
                inventoryFrom,
                inventoryTo,
                this
            );
            if(false === requirementsResult){
                return false;
            }
            let inventoryFromDecreaseItemQtyResult = true
            if(false === this.avoidExchangeDecrease[from]){
                inventoryFrom.frozenItems[itemUid] = Object.assign({}, inventoryFrom.items[itemUid]);
                inventoryFromDecreaseItemQtyResult = await inventoryFrom.decreaseItemQty(itemUid, itemQtyFrom);
            }
            // @NOTE: drop exchange is for when only care about giving rewards for items, for example selling an item,
            // if the seller is an NPC it won't need to add the sold item from the player to its own inventory.
            if(false === inventoryFromDecreaseItemQtyResult){
                this.lastErrorMessage = '' !== inventoryFrom.lastErrorMessage
                    ? 'Exchange inventory error. '+inventoryFrom.lastErrorMessage
                    : 'Exchange decreaseItemQty item error.';
                return false;
            }
            if(false === this.dropExchange[to]){
                let itemInstances = !sc.isArray(newItemFor) ? [newItemFor] : newItemFor;
                let addResult = await inventoryTo.addItems(itemInstances);
                if(false === addResult){
                    this.lastErrorMessage = '' !== inventoryTo.lastErrorMessage
                        ? 'Exchange add result error. '+inventoryTo.lastErrorMessage
                        : 'Exchange add item error.';
                    return false;
                }
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