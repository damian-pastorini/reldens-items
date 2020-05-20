/**
 *
 * Reldens - Items System - Inventory
 *
 */

const { Logger } = require('@reldens/utils');
const AwaitEventEmitter = require('await-event-emitter');
const ItemsConst = require('../constants');
const ItemsEvents = require('../items-events');

class Inventory
{

    constructor(props)
    {
        this.events = new AwaitEventEmitter();
        this.items = {};
        // @NOTE: -1 is for disable, 0 is reserved for possible items "seat" or "placeholder".
        this.limitPerItem = {}.hasOwnProperty.call(props, 'limitPerItem') ? props.limitPerItem : -1;
        this.itemsLimit = {}.hasOwnProperty.call(props, 'itemsLimit') ? props.itemsLimit : -1;
    }

    async validate(item)
    {
        let result = true;
        if(!item.getInventoryId()){
            Logger.error(['Add item error, undefined item ID.', item]);
            result = false;
        }
        if(!item.key){
            Logger.error(['Add item error, undefined item key.', item]);
            result = false;
        }
        await this.events.emit(ItemsEvents.VALIDATE, this, item, result);
        return result;
    }

    async addItem(item)
    {
        let isValid = await this.validate(item);
        if(!isValid){
            Logger.error('Invalid item: '+item.getInventoryId());
            return false;
        }
        if({}.hasOwnProperty.call(this.items, item.getInventoryId()) && !item.singleInstance){
            Logger.error('Cannot add item, item already exists: '+item.getInventoryId());
            return false;
        }
        if(Object.keys(this.items).length === this.itemsLimit && this.itemsLimit >= 0){
            Logger.error('Cannot add item, max total reached.');
            return false;
        }
        if(item.qty > this.limitPerItem && this.limitPerItem >= 0){
            Logger.error('Cannot add item, item qty limit exceeded.');
            return false;
        }
        if({}.hasOwnProperty.call(this.items, item.getInventoryId()) && item.singleInstance){
            await this.increaseItemQty(item.getInventoryId(), item.qty);
            return this.items[item.getInventoryId()];
        } else {
            await this.events.emit(ItemsEvents.ADD_ITEM_BEFORE, this, item);
            this.items[item.getInventoryId()] = item;
            await this.events.emit(ItemsEvents.ADD_ITEM, this, item);
        }
    }

    async setItem(item)
    {
        this.items[item.getInventoryId()] = item;
    }

    async removeItem(key)
    {
        if(!{}.hasOwnProperty.call(this.items, key)){
            Logger.info('Cannot remove item, key not found: '+key);
            return false;
        }
        await this.events.emit(ItemsEvents.REMOVE_ITEM, this, key);
        delete this.items[key];
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
        if(!{}.hasOwnProperty.call(this.items, key)){
            Logger.error('Cannot '+op+' item qty, undefined item key: '+key);
            return false;
        }
        if(isNaN(qty)){
            Logger.error('Cannot '+op+' item qty, qty is not a number: '+qty);
            return false;
        }
        if(
            this.limitPerItem > 0
            && qty > this.limitPerItem
            && (op === ItemsConst.SET || op === ItemsConst.INCREASE)
        ){
            Logger.error('Cannot '+op+' item qty, item qty limit exceeded: '+qty+' > '+this.limitPerItem);
            return false;
        }
        if(op === ItemsConst.SET){
            this.items[key].qty = qty;
        } else if(op === ItemsConst.INCREASE){
            this.items[key].qty += qty;
        } else if(op === ItemsConst.DECREASE){
            if((this.items[key].qty - qty) < 0){
                this.items[key].qty = 0;
            } else {
                this.items[key].qty -= qty;
            }
        }
        await this.events.emit(ItemsEvents.MODIFY_ITEM_QTY, this.items[key], this, op, key, qty);
        return this.items[key].qty;
    }

    setItems(items)
    {
        this.items = items;
        this.events.emit(ItemsEvents.SET_ITEMS, {items: items, manager: this});
    }

    setGroups(groups)
    {
        this.groups = groups;
        this.events.emit(ItemsEvents.SET_GROUPS, {groups: groups, manager: this});
    }

}

module.exports = Inventory;
