/**
 *
 * Reldens - Items System - Sender
 *
 * This class is a base example to handle what items information can be sent to a client. This requires a client to be
 * passed in the constructor, and it has to implement the send a broadcast methods of the system you are using for
 * communications.
 *
 * The way this class works is by implementing the properties manager (which helps to get an object properties), and
 * setting for each action an array of properties to be sent.
 *
 * For example:
 * this.setPropertyBehavior(ItemsConst.ACTION_REMOVE, props, {behavior: send, send: ['id', 'key']});
 * With this config when an item is removed from the inventory (the action), this class will parse the item
 * properties and use the method send (the behavior) on the client to send the 'id' and 'key' properties from that item.
 * Later this will be parsed on the receiver to process the message on the client side (see /lib/client/receiver).
 *
 */

const ItemsConst = require('../constants');
const ItemsEvents = require('../items-events');
const { PropertyManager } = require('@reldens/modifiers');
const { Logger, sc } = require('@reldens/utils');

class Sender
{

    constructor(props)
    {
        this.client = sc.get(props, 'client', false);
        this.manager = sc.get(props, 'manager', false);
        // @NOTE: here we will specify which item properties should be sent to the client on each call, potentially you
        // could send the full object, but won't be recommended mostly considering if you don't need all the data.
        this.sendProperties = sc.get(props, 'sendProperties', {});
        if(false === sc.hasOwn(props, 'sendProperties')){
            this.defineBehaviorForProperties();
        }
        this.sendTargetProps = sc.hasOwn(props, 'sendTargetProps') ? props.sendTargetProps : {broadcast: [], send: []};
        this.propertyManager = new PropertyManager();
        this.listenEvents();
    }

    validateManager()
    {
        if(!this.manager){
            Logger.critical('Undefined manager for Sender.');
            return false;
        }
        return true;
    }

    validateClient()
    {
        if(!this.client){
            Logger.critical('Undefined client for Sender.');
            return false;
        }
        // @NOTE: client must implement "send" and "broadcast" methods that will be used to send the action parameters.
        if(!sc.isObjectFunction(this.client, 'send')){
            Logger.critical('Required method "send" not found in client.', this.client, typeof this.client.send);
            return false;
        }
        if(!sc.isObjectFunction(this.client, 'broadcast')){
            Logger.critical('Required method "broadcast" not found in client.', this.client);
            return false;
        }
        return true;
    }

    defineBehaviorForProperties(props)
    {
        if(!props){
            props = {};
        }
        let send = ItemsConst.BEHAVIOR_SEND;
        let broadcast = ItemsConst.BEHAVIOR_BROADCAST;
        // @NOTE: so far I didn't find a case where I would need to broadcast let's say the item key that's been used
        // and some different data to the client, but I'll contemplate that case may happen and keep this as feature.
        // let both = ItemsConst.BEHAVIOR_BOTH;
        let addProperties = ['id', 'key', 'type', 'qty', 'label', 'description', 'group_id', 'qty_limit', 'uses_limit',
            'useTimeOut', 'execTimeOut', 'remaining_uses', 'is_active'];
        this.setPropertyBehavior(ItemsConst.ACTION_ADD, props, {behavior: send, send: addProperties});
        this.setPropertyBehavior(ItemsConst.ACTION_REMOVE, props, {behavior: send, send: ['id', 'key']});
        this.setPropertyBehavior(ItemsConst.ACTION_MODIFY_QTY, props, {behavior: send, send: ['id', 'key', 'qty']});
        this.setPropertyBehavior(ItemsConst.ACTION_MOD_APPLIED, props, {behavior: send, send: ['id', 'key']});
        this.setPropertyBehavior(ItemsConst.ACTION_MOD_REVERTED, props, {behavior: send, send: ['id', 'key']});
        // @NOTE: these may be broadcast or both if you like to make changes in the hero appearance or run any
        // animations for all the clients:
        this.setPropertyBehavior(ItemsConst.ACTION_EQUIP, props, {behavior: send, send: ['id', 'key']});
        this.setPropertyBehavior(ItemsConst.ACTION_UNEQUIP, props, {behavior: send, send: ['id', 'key']});
        // by default, we will broadcast the executing item as example:
        let executingPropsToSend = {behavior: broadcast, broadcast: ['id', 'key', 'animationData']};
        this.setPropertyBehavior(ItemsConst.ACTION_EXECUTING, props, executingPropsToSend);
        this.setPropertyBehavior(ItemsConst.ACTION_EXECUTED, props, {behavior: send, send: ['id', 'key']});
    }

    setPropertyBehavior(act, props, defaultProps)
    {
        if(sc.hasOwn(props, act)){
            this.sendProperties[act] = props[act];
        }
        this.sendProperties[act] = defaultProps;
    }

    getItemProperties(item, act, behavior)
    {
        if(!sc.hasOwn(this.sendProperties, act)){
            Logger.critical(
                'Undefined action while getting item properties.',
                {action: act, sendProperties: this.sendProperties}
            );
            return false;
        }
        if(!sc.hasOwn(this.sendProperties[act], behavior)){
            Logger.critical(
                'Undefined behavior while getting item properties.',
                {behavior, action: act, sendProperties: this.sendProperties}
            );
            return false;
        }
        let itemProps = {idx: item.getInventoryId()};
        for(let prop of this.sendProperties[act][behavior]){
            if(!sc.hasOwn(item, prop)){
                Logger.info('Undefined property: '+prop, item);
                continue;
            }
            itemProps[prop] = item[prop];
        }
        return itemProps;
    }

    listenEvents()
    {
        if(!this.validateManager()){
            return false;
        }
        let ownerEventKey = this.manager.getOwnerEventKey();
        this.manager.listenEvent(
            ItemsEvents.ADD_ITEM,
            this.sendAddItemData.bind(this),
            this.manager.getOwnerUniqueEventKey('addItemSend'),
            ownerEventKey
        );
        this.manager.listenEvent(
            ItemsEvents.REMOVE_ITEM,
            this.sendRemoveItemData.bind(this),
            this.manager.getOwnerUniqueEventKey('removeItemSend'),
            ownerEventKey
        );
        this.manager.listenEvent(
            ItemsEvents.MODIFY_ITEM_QTY,
            this.sendModifyItemQuantityData.bind(this),
            this.manager.getOwnerUniqueEventKey('modifyItemQtySend'),
            ownerEventKey
        );
        this.manager.listenEvent(
            ItemsEvents.EQUIP_ITEM,
            this.sendEquipItemActionData.bind(this),
            this.manager.getOwnerUniqueEventKey('equipItemSend'),
            ownerEventKey);
        this.manager.listenEvent(
            ItemsEvents.UNEQUIP_ITEM,
            this.sendUnequipItemActionData.bind(this),
            this.manager.getOwnerUniqueEventKey('unequipItemSend'),
            ownerEventKey
        );
        // @NOTE: check Item class changeModifiers method.
        this.manager.listenEvent(
            ItemsEvents.EQUIP+'AppliedModifiers',
            this.sendEquipItemAppliedModifiersData.bind(this),
            this.manager.getOwnerUniqueEventKey('equipItemAppliedModifiersSend'),
            ownerEventKey
        );
        this.manager.listenEvent(
            ItemsEvents.EQUIP+'RevertedModifiers',
            this.sendEquipItemRevertedModifiersData.bind(this),
            this.manager.getOwnerUniqueEventKey('equipItemRevertedModifiersSend'),
            ownerEventKey
        );
        this.manager.listenEvent(
            ItemsEvents.EXECUTING_ITEM,
            this.sendExecutingItemData.bind(this),
            this.manager.getOwnerUniqueEventKey('executingItemSend'),
            ownerEventKey
        );
        this.manager.listenEvent(
            ItemsEvents.EXECUTED_ITEM,
            this.sendExecutedItemData.bind(this),
            this.manager.getOwnerUniqueEventKey('executedItemSend'),
            ownerEventKey
        );
        this.manager.listenEvent(
            ItemsEvents.SET_ITEMS,
            this.sendSetItemsData.bind(this),
            this.manager.getOwnerUniqueEventKey('setItemsSend'),
            ownerEventKey
        );
        this.manager.listenEvent(
            ItemsEvents.SET_GROUPS,
            this.sendSetGroupsData.bind(this),
            this.manager.getOwnerUniqueEventKey('setGroupsSend'),
            ownerEventKey
        );
    }

    async sendSetGroupsData(data)
    {
        let ownerId = data.manager.getOwnerId();
        if (this.manager.getOwnerId() !== ownerId) {
            return false;
        }
        let groupsToSend = {};
        for (let i of Object.keys(data.groups)) {
            let {id, key, label, description, sort} = data.groups[i];
            groupsToSend[key] = {id, key, label, description, sort};
        }
        return await this.client.send({act: ItemsConst.ACTION_SET_GROUPS, owner: ownerId, groups: groupsToSend});
    }

    async sendSetItemsData(data)
    {
        let ownerId = data.manager.getOwnerId();
        if (this.manager.getOwnerId() !== ownerId) {
            return false;
        }
        let itemsToSend = this.extractItemsDataForSend(data.items);
        return await this.client.send({act: ItemsConst.ACTION_SET_ITEMS, owner: ownerId, items: itemsToSend});
    }

    async sendExecutedItemData(item)
    {
        return await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_EXECUTED);
    }

    async sendExecutingItemData(item)
    {
        return await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_EXECUTING);
    }

    async sendEquipItemRevertedModifiersData(item)
    {
        return await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_MOD_REVERTED);
    }

    async sendEquipItemAppliedModifiersData(item)
    {
        return await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_MOD_APPLIED);
    }

    async sendUnequipItemActionData(item)
    {
        return await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_UNEQUIP);
    }

    async sendEquipItemActionData(item)
    {
        return await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_EQUIP);
    }

    async sendModifyItemQuantityData(item, inventory, op, key, qty)
    {
        return await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_MODIFY_QTY);
    }

    async sendRemoveItemData(inventory, itemKey)
    {
        let item = inventory.items[itemKey];
        if(!item){
            Logger.debug('Item with key "'+itemKey+'" not found.');
            return false;
        }
        return await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_REMOVE);
    }

    async sendAddItemData(inventory, item)
    {
        return await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_ADD);
    }

    extractItemsDataForSend(items)
    {
        let itemsToSend = {};
        for(let i of Object.keys(items)){
            let item = items[i];
            let itemData = this.getItemProperties(item, ItemsConst.ACTION_ADD, ItemsConst.BEHAVIOR_SEND);
            itemData.singleInstance = item.singleInstance;
            itemsToSend[item.getInventoryId()] = itemData;
        }
        return itemsToSend;
    }

    async runBehaviors(item, ownerId, actionName)
    {
        if(!item){
            Logger.warning('Invalid "item" parameter.');
            return false;
        }
        if(!this.validateManager() || !this.validateClient()){
            return false;
        }
        if(this.manager.getOwnerId() !== ownerId){
            Logger.warning('Item owner ID miss match.', this.manager.getOwnerId(), ownerId);
            return false;
        }
        let actionProps = this.sendProperties[actionName];
        let targetProps = this.getTargetProps(item, actionProps.behavior);
        let isBoth = actionProps.behavior === ItemsConst.BEHAVIOR_BOTH;
        let isBroadcast = actionProps.behavior === ItemsConst.BEHAVIOR_BROADCAST;
        if(isBroadcast || isBoth){
            let itemData = this.getItemProperties(item, actionName, ItemsConst.BEHAVIOR_BROADCAST);
            let broadcastData = {act: actionName, owner: ownerId, item: itemData, target: targetProps};
            await this.client.broadcast(broadcastData);
            return;
        }
        let isSend = actionProps.behavior === ItemsConst.BEHAVIOR_SEND;
        let isAllowed = actionProps[ItemsConst.BEHAVIOR_SEND] !== actionProps[ItemsConst.BEHAVIOR_BROADCAST];
        if(isSend || (isBoth && isAllowed)){
            let itemData = this.getItemProperties(item, actionName, ItemsConst.BEHAVIOR_SEND);
            await this.client.send({act: actionName, owner: ownerId, item: itemData, targetProps});
        }
    }

    getTargetProps(item, actionBehavior)
    {
        let behavior = actionBehavior === ItemsConst.BEHAVIOR_BOTH
            ? ItemsConst.BEHAVIOR_BROADCAST
            : ItemsConst.BEHAVIOR_SEND;
        if(false === sc.hasOwn(this.sendTargetProps, behavior) || 0 === this.sendTargetProps[behavior].length){
            return {};
        }
        let targetProperties = {};
        for (let targetProperty of this.sendTargetProps[behavior]){
            let propertyKey = 'id' === targetProperty ? this.manager.ownerIdProperty : targetProperty;
            targetProperties[propertyKey] = this.propertyManager.getPropertyValue(item.target, propertyKey);
        }
        return targetProperties;
    }

}

module.exports = Sender;
