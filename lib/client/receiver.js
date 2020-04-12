/**
 *
 * Reldens - Items System - Receiver
 *
 */

const ItemsManager = require('../manager');
const ItemsConst = require('../constants');
const { ErrorManager } = require('@reldens/utils');

class Receiver
{

    constructor(props)
    {
        if(!{}.hasOwnProperty.call(props, 'owner')){
            ErrorManager.error('Undefined owner.');
        }
        // use an existent or create one instance of the manager:
        if({}.hasOwnProperty.call(props, 'manager')){
            this.manager = props.manager;
        } else {
            this.manager = new ItemsManager(props);
        }
    }

    processMessage(message)
    {
        if(message.act === ItemsConst.ACTION_SET_ITEMS){
            this.onSetItems(message);
        }
        if(message.act === ItemsConst.ACTION_ADD){
            this.onAddItem(message);
        }
        if(message.act === ItemsConst.ACTION_REMOVE){
            this.onRemoveItem(message);
        }
        if(message.act === ItemsConst.ACTION_MODIFY_QTY){
            this.onSetQty(message);
        }
        if(message.act === ItemsConst.ACTION_EQUIP){
            this.onEquipItem(message);
        }
        if(message.act === ItemsConst.ACTION_UNEQUIP){
            this.onUnequipItem(message);
        }
        if(message.act === ItemsConst.ACTION_MOD_APPLIED){
            this.onModifiersApplied(message.item);
        }
        if(message.act === ItemsConst.ACTION_MOD_REVERTED){
            this.onModifiersReverted(message.item);
        }
        if(message.act === ItemsConst.ACTION_EXECUTING){
            this.onExecuting(message.item);
        }
        if(message.act === ItemsConst.ACTION_EXECUTED){
            this.onExecuted(message.item);
        }
    }

    onSetItems(message)
    {
        this.manager.setItems(message.items);
    }

    onAddItem(message)
    {
        this.manager.addItem({key: message.item.key, qty: message.item.qty});
    }

    onRemoveItem(message)
    {
        this.manager.removeItem(message.item.key);
    }

    onSetQty(message)
    {
        this.manager.setItemQty(message.item.key, message.item.qty);
    }

    onEquipItem(message)
    {
        this.manager.items[message.item.key].equip(false);
    }

    onUnequipItem(message)
    {
        this.manager.items[message.item.key].unequip(false);
    }

    // @NOTE: override to apply custom behaviors on these.
    onModifiersApplied(message){}
    onModifiersReverted(message){}
    onExecuting(message){}
    onExecuted(message){}

}

module.exports = Receiver;
