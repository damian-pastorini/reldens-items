
const AwaitEventEmitter = require('await-event-emitter');
const { ItemsConst } = require('./constants');

class ItemManager
{

    constructor(props)
    {
        this.owner = false;
        this.inventory = {};
        this.events = new AwaitEventEmitter();
        Object.assign(this, props);
    }

    async addItem(item)
    {
        if(!item.key){
            console.error('ERROR - Can not add item, undefined item key.', item);
            return;
        }
        await this.events.emit('reldens.addItem', this, item);
        this.inventory[item.key] = item;
    }

    async removeItem(key)
    {
        if(!{}.hasOwnProperty.call(this.inventory, key)){
            console.warn('WARN - Can not remove item, key not found');
            return;
        }
        await this.events.emit('reldens.removeItem', this, key);
        delete this.inventory[key];
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
        if(!{}.hasOwnProperty.call(this.inventory, key)){
            console.error('ERROR - Can not '+op+' item qty, undefined item key.', key);
            return;
        }
        if(isNaN(qty)){
            console.error('ERROR - Can not '+op+' item qty, qty is not a number.', qty);
            return;
        }
        if(op === ItemsConst.SET){
            this.inventory[key].qty = qty;
        } else if(op === ItemsConst.INCREASE){
            this.inventory[key].qty += qty;
        } else if(op === ItemsConst.DECREASE){
            this.inventory[key].qty -= qty;
        }
        await this.events.emit('reldens.modifyItemQty', this, op, key, qty);
        return this.inventory[key].qty;
    }

}

module.exports.ItemManager = ItemManager;
