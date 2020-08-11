/**
 *
 * Reldens - Items System - ItemBase
 * All the items must have an ID which will be the unique identifier for that item instance for that inventory for that
 * owner. At the same time all items must have a key, which is the value string used for two important features:
 * reference the item class, and in case the item property singleInstance is true then the key will be used to reference
 * the item instead of the ID.
 *
 */

const { ErrorManager } = require('@reldens/utils');
const crypto = require('crypto');
const ItemsConst = require('../../constants');
const ItemsEvents = require('../../items-events');

class ItemBase
{

    constructor(props)
    {
        // the key is required for the item class:
        if(!{}.hasOwnProperty.call(props, 'key')){
            ErrorManager.error('Undefined item key.');
        }
        if(!{}.hasOwnProperty.call(props, 'manager')){
            ErrorManager.error('Undefined item manager.');
        }
        // @NOTE: for reference,
        // - "key" is used as easy understandable unique way to call an item type, additionally it's used as index key
        // if the current item is a "singleInstance" type (see below singleInstance property false by default).
        // - "uid" is an auto-generated value to used as index key if the item is not a "singleInstance" type.
        // - "id" here is the current item instance ID for this inventory, it can be null if you are not using any
        // storage (check the items_inventory table in default model storage) since for inventory management the "key"
        // and the "uid" are the properties used as indexes.
        // - "item_id" is the item type ID, idem as previous can be null if you are not using any storage (check the
        // items_item table).
        this.key = props.key;
        let cryptoId = crypto.randomBytes(8).toString('hex');
        this.uid = props.uid ? props.uid : this.key + (props.id ? '' : props.id) + cryptoId;
        this.id = props.id || null;
        this.item_id = props.item_id || null;
        this.label = props.label || '';
        this.description = props.description || '';
        this.manager = props.manager;
        this.type = ItemsConst.TYPE_BASE;
        this.qty = {}.hasOwnProperty.call(props, 'qty') ? props.qty : 0;
        this.remaining_uses = props.remaining_uses || 0;
        this.is_active = props.is_active || false;
        this.group_id = props.group_id || false;
        this.qty_limit = props.qty_limit || false;
        this.uses_limit = props.uses_limit || false;
        this.useTimeOut = props.useTimeOut || false;
        this.execTimeOut = props.execTimeOut || false;
        this.modifiers = {}.hasOwnProperty.call(props, 'modifiers') ? props.modifiers : {};
        this.target = false;
        this.singleInstance = false;
    }

    getInventoryId()
    {
        return this.singleInstance ? this.key : this.uid;
    }

    setProperties(props)
    {
        for(let k of Object.keys(props)){
            this[k] = props[k];
        }
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
        await this.manager.events.emit(ItemsEvents.EQUIP_BEFORE+(revert ? 'Revert': 'Apply')+'Modifiers', this);
        for(let i of Object.keys(this.modifiers)){
            if(revert){
                this.modifiers[i].revert();
            } else {
                this.modifiers[i].apply();
            }
        }
        return await this.manager.events.emit(ItemsEvents.EQUIP+(revert ? 'Reverted' : 'Applied')+'Modifiers', this);
    }

    isType(type)
    {
        return this.type === type;
    }

}

module.exports = ItemBase;
