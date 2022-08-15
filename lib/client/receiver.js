/**
 *
 * Reldens - Items System - Receiver
 *
 * This class is meant to be extended and used to parse the data sent by the server and run the same actions but using
 * different methods on the client side.
 *
 * Let's say you have an array of items in the server that you are sending to the client (see lib/server/sender.js).
 * You will be sending specific item data depending on the action. This is because you usually don't need to send the
 * full item data to the client. In the default Sender on this package we are sending just the item key and the id most
 * of the time except for when we add the item itself at which point we need more details (like qty, uses, etc).
 *
 * When you create an instance of this class you will need to pass a Manager instance in the constructor, this is
 * because when a message is received this class will replicate the action that was executed in the server but in the
 * client, this way you can use a new set of client-side custom classes (configured in this new Manager instance) to run
 * your items.
 *
 * Wait, what? why? Well... In your server, your items will be objects that will have specific methods for server
 * functions like persist your item data or run your item logic (following an authoritative server), but in your client,
 * you won't need any of those and probably will need different methods (for example, to run items animations) and at
 * the same time still keep a track of your items qty for display, that's where this class is useful.
 *
 */

const ItemsManager = require('../manager');
const ItemsConst = require('../constants');
const ItemGroup = require('../item/group');
const { Logger, ErrorManager, sc } = require('@reldens/utils');

class Receiver
{

    constructor(props)
    {
        if(!sc.hasOwn(props, 'owner')){
            ErrorManager.error('Undefined owner.');
        }
        this.manager = sc.hasOwn(props, 'manager') ? props.manager : new ItemsManager(props);
        this.actions = sc.hasOwn(props, 'actions') ? props.actions : {};
        if(false === sc.get(props, 'avoidDefaults', false)){
            this.setDefaultActions();
        }
    }

    setDefaultActions()
    {
        this.actions[ItemsConst.ACTION_SET_ITEMS] = 'onSetItems';
        this.actions[ItemsConst.ACTION_SET_GROUPS] = 'onSetGroups';
        this.actions[ItemsConst.ACTION_ADD] = 'onAddItem';
        this.actions[ItemsConst.ACTION_REMOVE] = 'onRemoveItem';
        this.actions[ItemsConst.ACTION_MODIFY_QTY] = 'onSetQty';
        this.actions[ItemsConst.ACTION_EQUIP] = 'onEquipItem';
        this.actions[ItemsConst.ACTION_UNEQUIP] = 'onUnequipItem';
        this.actions[ItemsConst.ACTION_MOD_APPLIED] = 'onModifiersApplied';
        this.actions[ItemsConst.ACTION_MOD_REVERTED] = 'onModifiersReverted';
        this.actions[ItemsConst.ACTION_EXECUTING] = 'onExecuting';
        this.actions[ItemsConst.ACTION_EXECUTED] = 'onExecuted';
    }

    processMessage(message)
    {
        // don't validate the message if the action prefix is not present or at the beginning of the message action:
        if(message.act && message.act.indexOf(ItemsConst.ACTIONS_PREF) !== 0){
            return false;
        }
        if(!sc.hasOwn(this.actions, message.act)){
            Logger.error(['Items action not found', message.act]);
            return false;
        }
        if('function' !== typeof this[this.actions[message.act]]){
            // for now, I'm leaving this a silent return (will probably end up making the error log configurable):
            // Logger.error(['Items action is not a function', message.act]);
            return false;
        }
        this[this.actions[message.act]](message);
    }

    onSetItems(message)
    {
        let tempItemsList = {};
        for(let i of Object.keys(message.items)){
            let messageItem = message.items[i];
            let itemsProps = Object.assign({manager: this.manager}, messageItem, {uid: i});
            let itemClass = this.getItemClass(itemsProps.key, itemsProps.type);
            tempItemsList[i] = new itemClass(itemsProps);
            if(tempItemsList[i].isType(ItemsConst.TYPES.EQUIPMENT) && sc.hasOwn(itemsProps, 'is_active')){
                tempItemsList[i].equipped = (itemsProps.is_active === 1);
            }
        }
        return this.manager.setItems(tempItemsList);
    }

    onSetGroups(message)
    {
        let tempGroupList = {};
        for(let i of Object.keys(message.groups)){
            let groupClass = this.getGroupClass(message.groups[i].key);
            tempGroupList[message.groups[i].key] = new groupClass(message.groups[i]);
        }
        return this.manager.setGroups(tempGroupList);
    }

    onAddItem(message)
    {
        // @NOTE: receiver must override the uid since it's already been set on the server.
        let itemsProps = Object.assign({manager: this.manager}, message.item, {uid: message.item.idx});
        let itemClass = this.getItemClass(itemsProps.key, itemsProps.type);
        let tmpItem = new itemClass(itemsProps);
        this.manager.addItem(tmpItem).catch((err) => {
            Logger.error(['Error receiver onAddItem.', err]);
        });
    }

    onRemoveItem(message)
    {
        this.manager.removeItem(message.item.idx).catch((err) => {
            Logger.error(['Error receiver onRemoveItem.', err]);
        });
    }

    onSetQty(message)
    {
        this.manager.setItemQty(message.item.idx, message.item.qty).catch((err) => {
            Logger.error(['Error receiver onSetQty.', err]);
        });
    }

    onEquipItem(message)
    {
        this.manager.items[message.item.idx].equip(false).catch((err) => {
            Logger.error(['Error receiver onEquipItem.', err]);
        });
    }

    onUnequipItem(message)
    {
        this.manager.items[message.item.idx].unequip(false).catch((err) => {
            Logger.error(['Error receiver onUnequipItem.', err]);
        });
    }

    // @NOTE: override to apply custom behaviors on these.
    onModifiersApplied(message){}
    onModifiersReverted(message){}
    onExecuting(message){}
    onExecuted(message){}

    getItemClass(key, typeId)
    {
        return sc.get(this.manager.itemClasses, key, this.manager.types.classByTypeId(typeId));
    }

    getGroupClass(key)
    {
        let groupClass = ItemGroup;
        if(sc.hasOwn(this.manager.groupClasses, key)){
            groupClass = this.manager.groupClasses[key];
        }
        return groupClass;
    }

}

module.exports = Receiver;
