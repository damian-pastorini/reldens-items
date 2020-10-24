/**
 *
 * Reldens - Items System - ItemBase
 *
 * This class is the base for every item object, it has the basic properties present on every item, handles the events
 * and manage the items modifiers.
 * Items modifiers is the way the items affect the target (see @reldens/modifiers package and documentation), these are
 * applied when the item is executed (see equip / unequip / use methods in the different items types).
 *
 * About the item properties:
 * - "key" is used as easy understandable unique way to call an item type, additionally it's used as index key if the
 * current item is a "singleInstance" type (see below singleInstance property false by default).
 * - "uid" is an auto-generated value to used as index key if the item is not a "singleInstance" type.
 * - "id" here is the current item instance ID for this inventory, it can be null if you are not using any storage
 * (check the items_inventory table in default model storage) since for inventory management the "key" and the "uid"
 * are the properties used as indexes.
 * - "item_id" is the item type ID, idem as previous can be null if you are not using any storage (check the items_item
 * table).
 *
 */

const crypto = require('crypto');
const ItemsConst = require('../../constants');
const ItemsEvents = require('../../items-events');
const { ErrorManager, sc } = require('@reldens/utils');

class ItemBase
{

    constructor(props)
    {
        // the key is required for the item class:
        if(!sc.hasOwn(props, 'key')){
            ErrorManager.error('Undefined item key.');
        }
        if(!sc.hasOwn(props, 'manager')){
            ErrorManager.error('Undefined item manager.');
        }
        this.key = props.key;
        let cryptoId = crypto.randomBytes(8).toString('hex');
        this.uid = props.uid ? props.uid : this.key + (props.id ? '' : props.id) + cryptoId;
        this.id = props.id || null;
        this.item_id = props.item_id || null;
        this.label = props.label || '';
        this.description = props.description || '';
        this.manager = props.manager;
        this.type = ItemsConst.TYPE_BASE;
        this.qty = sc.hasOwn(props, 'qty') ? props.qty : 0;
        this.remaining_uses = props.remaining_uses || 0;
        this.is_active = props.is_active || false;
        this.group_id = props.group_id || false;
        this.qty_limit = props.qty_limit || false;
        this.uses_limit = props.uses_limit || false;
        this.useTimeOut = props.useTimeOut || false;
        this.execTimeOut = props.execTimeOut || false;
        this.modifiers = sc.hasOwn(props, 'modifiers') ? props.modifiers : {};
        this.target = false;
        this.singleInstance = false;
    }

    getInventoryId()
    {
        return this.singleInstance ? this.key : this.uid;
    }

    async applyModifiers()
    {
        return await this.changeModifiers();
    }

    async revertModifiers()
    {
        return await this.changeModifiers(true);
    }

    async changeModifiers(revert)
    {
        await this.manager.fireEvent(ItemsEvents.EQUIP_BEFORE+(revert ? 'Revert': 'Apply')+'Modifiers', this);
        for(let i of Object.keys(this.modifiers)){
            if(revert){
                this.modifiers[i].revert();
            } else {
                this.modifiers[i].apply();
            }
        }
        return this.manager.fireEvent(ItemsEvents.EQUIP+(revert ? 'Reverted' : 'Applied')+'Modifiers', this);
    }

    isType(type)
    {
        return this.type === type;
    }

    async fireEvent(eventName, ...args)
    {
        return this.manager.fireEvent(eventName, ...args);
    }

    listenEvent(eventName, callback, removeKey, masterKey)
    {
        return this.manager.listenEvent(eventName, callback, removeKey, masterKey);
    }
}

module.exports = ItemBase;
