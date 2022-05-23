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
        this.uid = props.uid ? props.uid : this.key + (props.id ? '' : props.id) + sc.makeId(8);
        this.id = sc.get(props, 'id', null);
        this.item_id = sc.get(props, 'item_id', null);
        this.label = sc.get(props, 'label', '');
        this.description = sc.get(props, 'description', '');
        this.manager = props.manager;
        this.type = sc.get(props, 'type', ItemsConst.TYPES.ITEM_BASE);
        this.qty = sc.get(props, 'qty', 0);
        this.remaining_uses = props.remaining_uses || 0;
        this.is_active = sc.get(props, 'is_active', false);
        this.group_id = sc.get(props, 'group_id', false);
        this.qty_limit = sc.get(props, 'qty_limit', false);
        this.uses_limit = sc.get(props, 'uses_limit', false);
        this.useTimeOut = sc.get(props, 'useTimeOut', false);
        this.execTimeOut = sc.get(props, 'execTimeOut', false);
        this.modifiers = sc.get(props, 'modifiers', {});
        this.target = false;
        this.singleInstance = false;
        this.rawCustomData = sc.get(props, 'customData', {});
        let customData = ('string' === typeof this.rawCustomData)
            ? sc.toJson(this.rawCustomData, {})
            : this.rawCustomData;
        if(null !== customData && 'object' === typeof customData && 0 < Object.keys(customData).length){
            Object.assign(this, customData);
        }
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
        let modifiersKeys = Object.keys(this.modifiers);
        if(0 >= modifiersKeys.length){
            return;
        }
        let methodName = revert ? 'revert' : 'apply';
        for(let i of modifiersKeys){
            this.modifiers[i][methodName](this.target);
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
