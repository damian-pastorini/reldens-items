/**
 *
 * Reldens - Items System - Sender
 *
 */

const { Logger, ErrorManager } = require('@reldens/utils');
const ItemsConst = require('../constants');
const ItemsEvents = require('../items-events');

class Sender
{

    constructor(manager, client = false)
    {
        if(!client){
            ErrorManager.error('Undefined client for Sender.');
        }
        this.manager = manager;
        this.client = client;
        // @NOTE: here we will specify which item properties should be sent to the client on each call, potentially you
        // could send the full object, but won't be recommended mostly considering if you don't need all the data.
        this.sendProperties = {};
        this.sendTargetProps = {broadcast: [], send: []};
        this.defineBehaviorForProperties();
        this.listenEvents();
    }

    defineBehaviorForProperties(props)
    {
        if(!props){
            props = {};
        }
        // @TODO: all these will be configurable from the storage.
        let send = ItemsConst.BEHAVIOR_SEND;
        let broadcast = ItemsConst.BEHAVIOR_BROADCAST;
        // @NOTE: so far I didn't find a case where I would need to broadcast let's say the item key that's been used
        // and some different data to the client, but I'll contemplate that case may happen and keep this as feature.
        // let both = ItemsConst.BEHAVIOR_BOTH;
        let addProperties = ['id', 'key', 'qty', 'label', 'description', 'group_id', 'qty_limit', 'uses_limit',
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
        // by default we will broadcast the executing item as example:
        let executingPropsToSend = {behavior: broadcast, broadcast: ['id', 'key', 'animationData']};
        this.setPropertyBehavior(ItemsConst.ACTION_EXECUTING, props, executingPropsToSend);
        this.setPropertyBehavior(ItemsConst.ACTION_EXECUTED, props, {behavior: send, send: ['id', 'key']});
    }

    setPropertyBehavior(act, props, defaultProps)
    {
        if({}.hasOwnProperty.call(props, act)){
            this.sendProperties[act] = props[act];
        }
        this.sendProperties[act] = defaultProps;
    }

    getItemProperties(item, act, behavior)
    {
        if(!{}.hasOwnProperty.call(this.sendProperties, act)){
            ErrorManager.error(['Undefined action:', act, 'In sendProperties:', this.sendProperties]);
        }
        if(!{}.hasOwnProperty.call(this.sendProperties[act], behavior)){
            ErrorManager.error([
                'Undefined behavior:', behavior, 'Action:', act, 'In sendProperties:', this.sendProperties
            ]);
        }
        let itemProps = {idx: item.getInventoryId()};
        for(let prop of this.sendProperties[act][behavior]){
            if({}.hasOwnProperty.call(item, prop)){
                itemProps[prop] = item[prop];
            } else {
                Logger.error(['Undefined property:', prop, 'Item:', item.getInventoryId()]);
            }
        }
        return itemProps;
    }

    listenEvents()
    {
        // eslint-disable-next-line no-unused-vars
        this.manager.events.on(ItemsEvents.ADD_ITEM, async (inventory, item) => {
            await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_ADD);
        });
        // eslint-disable-next-line no-unused-vars
        this.manager.events.on(ItemsEvents.REMOVE_ITEM, async (inventory, itemKey) => {
            let item = inventory.items[itemKey];
            await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_REMOVE);
        });
        // eslint-disable-next-line no-unused-vars
        this.manager.events.on(ItemsEvents.MODIFY_ITEM_QTY, async (item, inventory, op, key, qty) => {
            await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_MODIFY_QTY);
        });
        this.manager.events.on(ItemsEvents.EQUIP_ITEM, async (item) => {
            await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_EQUIP);
        });
        this.manager.events.on(ItemsEvents.UNEQUIP_ITEM, async (item) => {
            await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_UNEQUIP);
        });
        // @NOTE: check Item class changeModifiers method.
        this.manager.events.on(ItemsEvents.EQUIP+'AppliedModifiers', async (item) => {
            await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_MOD_APPLIED);
        });
        this.manager.events.on(ItemsEvents.EQUIP+'RevertedModifiers', async (item) => {
            await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_MOD_REVERTED);
        });
        this.manager.events.on(ItemsEvents.EXECUTING_ITEM, async (item) => {
            await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_EXECUTING);
        });
        this.manager.events.on(ItemsEvents.EXECUTED_ITEM, async (item) => {
            await this.runBehaviors(item, item.manager.getOwnerId(), ItemsConst.ACTION_EXECUTED);
        });
        this.manager.events.on(ItemsEvents.SET_ITEMS, async (data) => {
            let ownerId = data.manager.getOwnerId();
            if(this.manager.getOwnerId() !== ownerId){
                return false;
            }
            let itemsToSend = {};
            for(let i of Object.keys(data.items)){
                let item = data.items[i];
                let itemData = this.getItemProperties(item, ItemsConst.ACTION_ADD, ItemsConst.BEHAVIOR_SEND);
                itemData.singleInstance = item.singleInstance;
                itemsToSend[item.getInventoryId()] = itemData;
            }
            await this.client.send({act: ItemsConst.ACTION_SET_ITEMS, owner: ownerId, items: itemsToSend});
        });
        this.manager.events.on(ItemsEvents.SET_GROUPS, async (data) => {
            let ownerId = data.manager.getOwnerId();
            if(this.manager.getOwnerId() !== ownerId){
                return false;
            }
            let groupsToSend = {};
            for(let i of Object.keys(data.groups)){
                let {id, key, label, description, sort} = data.groups[i];
                groupsToSend[key] = {id, key, label, description, sort};
            }
            await this.client.send({act: ItemsConst.ACTION_SET_GROUPS, owner: ownerId, groups: groupsToSend});
        });
    }

    async runBehaviors(item, ownerId, actionName)
    {
        if (this.manager.getOwnerId() !== ownerId) {
            return false;
        }
        let actionProps = this.sendProperties[actionName];
        let targetProps = this.getTargetProps(item, actionProps.behavior);
        if(
            actionProps.behavior === ItemsConst.BEHAVIOR_BROADCAST
            || actionProps.behavior === ItemsConst.BEHAVIOR_BOTH
        ){
            let itemData = this.getItemProperties(item, actionName, ItemsConst.BEHAVIOR_BROADCAST);
            let broadcastData = {act: actionName, owner: ownerId, item: itemData, target: targetProps};
            await this.client.broadcast(broadcastData);
        } else if(
            actionProps.behavior === ItemsConst.BEHAVIOR_SEND
            || (
                actionProps.behavior === ItemsConst.BEHAVIOR_BOTH
                && actionProps[ItemsConst.BEHAVIOR_SEND] !== actionProps[ItemsConst.BEHAVIOR_BROADCAST]
            )
        ){
            let itemData = this.getItemProperties(item, actionName, ItemsConst.BEHAVIOR_SEND);
            await this.client.send({act: actionName, owner: ownerId, item: itemData, targetProps});
        }
    }

    getTargetProps(item, actionBehavior)
    {
        let targetProps = {};
        let behavior = actionBehavior === ItemsConst.BEHAVIOR_BOTH ?
            ItemsConst.BEHAVIOR_BROADCAST : ItemsConst.BEHAVIOR_SEND;
        if({}.hasOwnProperty.call(this.sendTargetProps, behavior) && this.sendTargetProps[behavior].length){
            for (let tProp of this.sendTargetProps[behavior]){
                if(tProp === 'id'){
                    tProp = this.manager.ownerIdProperty;
                }
                targetProps[tProp] = item.getOwnerProperty(tProp);
            }
        }
        return targetProps;
    }

}

module.exports = Sender;
