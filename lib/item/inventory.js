
const { Logger, EventsManager } = require('@reldens/utils');
const { ItemsConst } = require('../constants');

class Inventory
{

    constructor(props)
    {
        this.events = EventsManager;
        this.items = {};
        this.limitPerItem = {}.hasOwnProperty.call(props, 'limitPerItem') ? props.limitPerItem : 0;
        this.itemsLimit = {}.hasOwnProperty.call(props, 'itemsLimit') ? props.itemsLimit : 0;
    }

    async addItem(item)
    {
        if(!item.key){
            Logger.error(['Add item error, undefined item key.', item]);
            return false;
        }
        if({}.hasOwnProperty.call(this.items, item.key)){
            Logger.error('Cannot add item, item already exists: '+item.key);
            return false;
        }
        if({}.keys(this.items).length === this.itemsLimit){
            Logger.error('Cannot add item, max total reached.');
            return false;
        }
        if(this.limitPerItem > 0 && item.qty > this.limitPerItem){
            Logger.error('Cannot add item, item qty limit exceeded.');
            return false;
        }
        await this.events.emit('reldens.addItem', this, item);
        this.items[item.key] = item;
    }

    async setItem(item)
    {
        if(!{}.hasOwnProperty.call(this.items, item.key)){
            Logger.error('Set item error, undefined item key: '+item.key);
            return false;
        }
        this.items[item.key] = item;
    }

    async removeItem(key)
    {
        if(!{}.hasOwnProperty.call(this.items, key)){
            Logger.info('Cannot remove item, key not found: '+key);
            return false;
        }
        await this.events.emit('reldens.removeItem', this, key);
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
        await this.events.emit('reldens.modifyItemQty', this, op, key, qty);
        return this.items[key].qty;
    }

}

module.exports.Inventory = Inventory;
