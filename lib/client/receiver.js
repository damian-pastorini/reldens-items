/**
 *
 * Reldens - Items System - Receiver
 *
 */

const ItemsManager = require('../manager');
const ItemsConst = require('../constants');
const ItemBase = require('../item/type/item-base');
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
        // don't validate the message if the action prefix is not present or at the beginning of the message action:
        if(message.act.indexOf(ItemsConst.ACTIONS_PREF) !== 0){
            return false;
        }
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
        let tempItemsList = {};
        for(let idx in message.items){
            let messageItem = message.items[idx];
            let itemsProps = Object.assign({manager: this.manager}, messageItem, {uid: idx});
            let itemClass = this.getItemClass(itemsProps.key);
            let tmpItem = new itemClass(itemsProps);
            tempItemsList[idx] = tmpItem;
        }
        this.manager.setItems(tempItemsList);
    }

    onAddItem(message)
    {
        // @NOTE: receiver must override the uid since it's already been set on the server.
        let itemsProps = Object.assign({manager: this.manager}, message.item, {uid: message.item.idx});
        let itemClass = this.getItemClass(itemsProps.key);
        let tmpItem = new itemClass(itemsProps);
        this.manager.addItem(tmpItem);
    }

    onRemoveItem(message)
    {
        this.manager.removeItem(message.item.idx);
    }

    onSetQty(message)
    {
        this.manager.setItemQty(message.item.idx, message.item.qty);
    }

    onEquipItem(message)
    {
        this.manager.items[message.item.idx].equip(false);
    }

    onUnequipItem(message)
    {
        this.manager.items[message.item.idx].unequip(false);
    }

    // @NOTE: override to apply custom behaviors on these.
    onModifiersApplied(message){}
    onModifiersReverted(message){}
    onExecuting(message){}
    onExecuted(message){}

    getItemClass(key)
    {
        let itemClass = ItemBase;
        if({}.hasOwnProperty.call(this.manager.itemClasses, key)){
            itemClass = this.manager.itemClasses[key];
        }
        return itemClass;
    }

}

module.exports = Receiver;
