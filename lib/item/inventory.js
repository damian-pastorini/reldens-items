/**
 *
 * Reldens - Items System - Inventory
 *
 * This will be the "main" class of this system, the inventory handles all the items actions add / modify qty / remove.
 * Also has the events handlers.
 *
 */

const ItemsConst = require('../constants');
const ItemsEvents = require('../items-events');
const { EventsManagerSingleton, sc } = require('@reldens/utils');

class Inventory
{

    constructor(props)
    {
        this.events = sc.get(props, 'eventsManager', EventsManagerSingleton);
        // @TODO - BETA - Create an ItemsCollection based on a generic Collection class.
        this.items = {};
        // @NOTE: -1 is for disable, 0 is reserved for possible items "seat" or "placeholder".
        this.limitPerItem = sc.get(props, 'limitPerItem', -1);
        this.itemsLimit = sc.get(props, 'itemsLimit', -1);
        // general settings for items that use modifiers (so you don't need to specify these on each item):
        this.applyModifiersAuto = sc.get(props, 'applyModifiersAuto', true);
        this.revertModifiersAuto = sc.get(props, 'revertModifiersAuto', true);
        this.locked = false;
        // events prefix is used for groups to avoid emitting normal inventory events but still emit group events:
        this.eventsPref = sc.get(props, 'eventsPref', '');
        this.lastErrorMessage = '';
        this.frozenItems = {};
    }

    async validate(item)
    {
        let result = true;
        if(!item){
            this.lastErrorMessage = 'Add item error, undefined item.';
            result = false;
        }
        if(!sc.isObjectFunction(item, 'getInventoryId')){
            this.lastErrorMessage = 'Add item error, undefined getInventoryId.';
            result = false;
        }
        if(!item.key){
            this.lastErrorMessage = 'Add item error, undefined item key.';
            result = false;
        }
        await this.fireEvent(ItemsEvents.VALIDATE, this, item, result);
        return result;
    }

    findItemByKey(itemKey)
    {
        return sc.fetchByPropertyOnObject(this.items, 'key', itemKey);
    }

    findItemsByPropertyValue(propertyKey, propertyValue)
    {
        return sc.fetchAllByPropertyOnObject(this.items, propertyKey, propertyValue);
    }

    async addItem(item)
    {
        let isValid = await this.validate(item);
        if(!isValid){
            this.lastErrorMessage = 'Invalid item instance.';
            return false;
        }
        let itemId = item.getInventoryId();
        if(this.locked){
            this.lastErrorMessage = 'Inventory locked, cannot add item: '+itemId;
            return false;
        }
        if(this.itemsLimit === Object.keys(this.items).length && 0 <= this.itemsLimit){
            this.lastErrorMessage = 'Cannot add item, max total reached.';
            return false;
        }
        if(sc.hasOwn(this.items, itemId) && !item.singleInstance){
            this.lastErrorMessage = 'Cannot add item, item already exists: '+itemId;
            return false;
        }
        if(item.qty > this.limitPerItem && 0 <= this.limitPerItem){
            this.lastErrorMessage = 'Cannot add item, item qty limit exceeded.';
            return false;
        }
        if(sc.hasOwn(this.items, itemId) && item.singleInstance){
            await this.increaseItemQty(itemId, item.qty);
            return this.items[itemId];
        }
        await this.fireEvent(ItemsEvents.ADD_ITEM_BEFORE, this, item);
        this.items[itemId] = item;
        await this.fireEvent(ItemsEvents.ADD_ITEM, this, item);
        return this.items[itemId];
    }

    async addItems(itemsArray)
    {
        for(let item of itemsArray){
            let addResult = await this.addItem(item);
            if(!addResult){
                this.lastErrorMessage = 'Cannot add item "'+item.getInventoryId()+'".';
                return false;
            }
        }
        return true;
    }

    async setItem(item)
    {
        if(this.locked){
            this.lastErrorMessage = 'Inventory locked, cannot set item: '+item.getInventoryId();
            return false;
        }
        this.items[item.getInventoryId()] = item;
    }

    async removeItem(key)
    {
        if(this.locked){
            this.lastErrorMessage = 'Inventory locked, cannot remove item: '+key;
            return false;
        }
        if(!sc.hasOwn(this.items, key)){
            this.lastErrorMessage = 'Cannot remove item, key not found: '+key;
            return false;
        }
        await this.fireEvent(ItemsEvents.REMOVE_ITEM, this, key);
        delete this.items[key];
        return true;
    }

    async setItemQty(key, qty)
    {
        return this.modifyItemQty(ItemsConst.SET, key, qty);
    }

    async increaseItemQty(key, qty)
    {
        return this.modifyItemQty(ItemsConst.INCREASE, key, qty);
    }

    async decreaseItemQty(key, qty)
    {
        return this.modifyItemQty(ItemsConst.DECREASE, key, qty);
    }

    async modifyItemQty(op, key, qty)
    {
        if(this.locked){
            this.lastErrorMessage = 'Inventory locked, cannot modify item qty: '+key;
            return false;
        }
        if(!sc.hasOwn(this.items, key)){
            this.lastErrorMessage = 'Cannot '+op+' item qty, undefined item key: '+key;
            return false;
        }
        if(isNaN(qty)){
            this.lastErrorMessage = 'Cannot '+op+' item qty, qty is not a number: '+qty;
            return false;
        }
        if(
            this.limitPerItem > 0
            && qty > this.limitPerItem
            && (op === ItemsConst.SET || op === ItemsConst.INCREASE)
        ){
            this.lastErrorMessage = 'Cannot '+op+' item qty, item qty limit exceeded: '+qty+' > '+this.limitPerItem;
            return false;
        }
        if(op === ItemsConst.SET){
            this.items[key].qty = qty;
        }
        if(op === ItemsConst.INCREASE){
            this.items[key].qty += qty;
        }
        if(op === ItemsConst.DECREASE){
            let newQty = this.items[key].qty - qty;
            if(0 > newQty){
                newQty = 0;
            }
            this.items[key].qty = newQty;
        }
        if(0 === this.items[key].qty && this.items[key].autoRemoveItemOnZeroQty){
            await this.fireEvent(ItemsEvents.MODIFY_ITEM_QTY, this.items[key], this, op, key, qty);
            return await this.removeItem(this.items[key].getInventoryId());
        }
        await this.fireEvent(ItemsEvents.MODIFY_ITEM_QTY, this.items[key], this, op, key, qty);
        return true;
    }

    async setItems(items)
    {
        if(this.locked){
            this.lastErrorMessage = 'Inventory locked, cannot set items.';
            return false;
        }
        this.items = items;
        return this.fireEvent(ItemsEvents.SET_ITEMS, {items: items, manager: this});
    }

    async setGroups(groups)
    {
        this.groups = groups;
        return this.fireEvent(ItemsEvents.SET_GROUPS, {groups: groups, manager: this});
    }

    fireEvent(eventName, ...args)
    {
        return this.events.emit(this.eventFullName(eventName), ...args);
    }

    listenEvent(eventName, callback, removeKey, masterKey)
    {
        return this.events.onWithKey(this.eventFullName(eventName), callback, removeKey, masterKey);
    }

    eventFullName(eventName)
    {
        return this.eventsPref+'.'+eventName;
    }

}

module.exports = Inventory;
