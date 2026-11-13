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
 * of the time except for when we add the item itself at which point we need more details (like qty, uses, etc.).
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
 * The client only replicates the server actions, so the manager created by the receiver never unequips an item on its
 * removal (unequipOnRemove off): the server sends its own unequip action before the removal when it unequips the item.
 *
 */

const ItemsManager = require('../manager');
const ItemsConst = require('../constants');
const ItemsEvents = require('../items-events');
const ItemGroup = require('../item/group');
const { ErrorManager, Logger, sc } = require('@reldens/utils');

class Receiver
{

    constructor(props)
    {
        if(!sc.hasOwn(props, 'owner')){
            ErrorManager.error('Undefined owner.');
        }
        this.manager = sc.hasOwn(props, 'manager')
            ? props.manager
            : new ItemsManager(Object.assign({}, props, {unequipOnRemove: false}));
        this.actions = sc.hasOwn(props, 'actions') ? props.actions : {};
        if(false === sc.get(props, 'avoidDefaults', false)){
            this.setDefaultActions();
        }
        this.recieveErrorsLog = [];
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
        this.actions[ItemsConst.ACTION_UPDATE] = 'onUpdateItem';
        this.actions[ItemsConst.ACTION_MOD_APPLIED] = 'onModifiersApplied';
        this.actions[ItemsConst.ACTION_MOD_REVERTED] = 'onModifiersReverted';
        this.actions[ItemsConst.ACTION_EXECUTING] = 'onExecuting';
        this.actions[ItemsConst.ACTION_EXECUTED] = 'onExecuted';
    }

    async processMessage(message)
    {
        // don't validate the message if the action prefix is not present or at the beginning of the message action:
        let action = sc.get(message, 'act', '');
        if(0 !== action.indexOf(ItemsConst.ACTIONS_PREF)){
            return false;
        }
        if(!sc.hasOwn(this.actions, action)){
            Logger.error('Items action not found', action, message);
            return false;
        }
        let actionMethod = this.actions[action];
        if('function' !== typeof this[actionMethod]){
            Logger.info('Items action is not a function.', message.act);
            return false;
        }
        try {
            return await this[actionMethod](message);
        } catch(error) {
            Logger.error('Items action "'+actionMethod+'" failed.', error);
            this.recieveErrorsLog.push({['Error receiver '+actionMethod+'.']: error});
            return false;
        }
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
                tempItemsList[i].equipped = (1 === itemsProps.is_active);
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

    async onAddItem(message)
    {
        // @NOTE: receiver must override the uid since it's already been set on the server.
        return await this.manager.addItem(new (this.getItemClass(message.item.key, message.item.type))(
            Object.assign({manager: this.manager}, message.item, {uid: message.item.idx})
        ));
    }

    async onRemoveItem(message)
    {
        return await this.manager.removeItem(message.item.idx);
    }

    async onSetQty(message)
    {
        return await this.manager.setItemQty(message.item.idx, message.item.qty);
    }

    async onEquipItem(message)
    {
        await this.manager.items[message.item.idx].equip(false);
        return true;
    }

    async onUnequipItem(message)
    {
        await this.manager.items[message.item.idx].unequip(false);
        return true;
    }

    async onUpdateItem(message)
    {
        let itemIdx = sc.get(sc.get(message, 'item', {}), 'idx', '');
        let item = sc.get(this.manager.items, itemIdx, false);
        if(!item){
            this.recieveErrorsLog.push({'Error receiver onUpdateItem.': 'Item not found: '+itemIdx});
            return false;
        }
        item.updateProperties(message.item);
        await this.manager.fireEvent(ItemsEvents.UPDATE_ITEM, item);
        return true;
    }

    // @NOTE: override to apply custom behaviors on these.
    onModifiersApplied()
    {
    }

    onModifiersReverted()
    {
    }

    onExecuting()
    {
    }

    onExecuted()
    {
    }

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
