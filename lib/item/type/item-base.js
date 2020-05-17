/**
 *
 * Reldens - Items System - ItemBase
 * All the items must have an ID which will be the unique identifier for that item instance for that inventory for that
 * owner. At the same time all items must have a key, which is the value string used for two important features:
 * reference the item class, and in case the item property singleInstance is true then the key will be used to reference
 * the item instead of the ID.
 *
 */

const { Logger, ErrorManager } = require('@reldens/utils');
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
        for(let k in props){
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
        for(let idx in this.modifiers){
            let modifier = this.modifiers[idx];
            let ownerProperty = this.getOwnerProperty(modifier.propertyKey);
            let newValue = this.modifyValue(modifier, ownerProperty, revert);
            this.setOwnerProperty(modifier.propertyKey, newValue);
        }
        return await this.manager.events.emit(ItemsEvents.EQUIP+(revert ? 'Reverted' : 'Applied')+'Modifiers', this);
    }

    modifyValue(modifier, ownerProperty, revert = false)
    {
        // @TODO: this is a temporal list of limited operations which can be improved.
        // @NOTE: all of this need an opposite method so we can revert it later, except for SET and APPLY_METHOD.
        if(modifier.operation === ItemsConst.OPS.INC || (modifier.operation === ItemsConst.OPS.DEC && revert)){
            ownerProperty += modifier.value;
        }
        if(modifier.operation === ItemsConst.OPS.DEC || (modifier.operation === ItemsConst.OPS.INC && revert)){
            ownerProperty -= modifier.value;
        }
        if(modifier.operation === ItemsConst.OPS.MUL || (modifier.operation === ItemsConst.OPS.DIV && revert)){
            ownerProperty = ownerProperty * modifier.value;
        }
        if(modifier.operation === ItemsConst.OPS.DIV || (modifier.operation === ItemsConst.OPS.MUL && revert)){
            ownerProperty = ownerProperty / modifier.value;
        }
        if(modifier.operation === ItemsConst.OPS.INC_P || (modifier.operation === ItemsConst.OPS.DEC_P && revert)){
            ownerProperty += ownerProperty * modifier.value / 100;
        }
        if(modifier.operation === ItemsConst.OPS.DEC_P || (modifier.operation === ItemsConst.OPS.INC_P && revert)){
            ownerProperty -= ownerProperty * modifier.value / 100;
        }
        if(modifier.operation === ItemsConst.OPS.SET){
            if(revert){
                ownerProperty = false;
            } else {
                ownerProperty = modifier.value;
            }
        }
        if(modifier.operation === ItemsConst.OPS.METHOD){
            if(!{}.hasOwnProperty.call(this, modifier.value) || typeof this[modifier.value] !== 'function'){
                Logger.error(['Item modifier error:', this.getInventoryId(), 'Undefined method:', modifier.value]);
            } else {
                ownerProperty = this[modifier.value](modifier, ownerProperty);
            }
        }
        // apply modifier min and max values if required:
        return this.applyModifierLimits(modifier, ownerProperty);
    }

    applyModifierLimits(modifier, ownerProperty)
    {
        if(modifier.minValue && ownerProperty < modifier.minValue){
            ownerProperty = modifier.minValue;
        }
        if(modifier.maxValue && ownerProperty > modifier.maxValue){
            ownerProperty = modifier.maxValue;
        }
        if(modifier.minProperty){
            let minPropValue = this.getOwnerProperty(modifier.minProperty);
            if(minPropValue && ownerProperty < minPropValue){
                ownerProperty = minPropValue;
            }
        }
        if(modifier.maxProperty){
            let maxPropValue = this.getOwnerProperty(modifier.maxProperty);
            if(maxPropValue && ownerProperty > maxPropValue){
                ownerProperty = maxPropValue;
            }
        }
        return ownerProperty;
    }

    getOwnerProperty(property)
    {
        return this.manageOwnerProperty(property);
    }

    setOwnerProperty(property, value)
    {
        return this.manageOwnerProperty(property, value);
    }

    manageOwnerProperty(property, value)
    {
        // by default the target is the owner:
        let obj = this.manager.owner;
        // unless target was specified before apply the modifiers:
        if(this.target){
            obj = this.target;
        }
        let propName = property;
        if(property.indexOf('/') !== -1){
            let propArray = property.split('/');
            propName = propArray.pop();
            for(let prop of propArray){
                if(!{}.hasOwnProperty.call(obj, prop)){
                    ErrorManager.error(['Owner property not found in path:', property, prop, 'Object:', obj]);
                }
                obj = obj[prop];
            }
        }
        if(typeof value !== 'undefined'){
            obj[propName] = value;
        }
        return obj[propName];
    }

}

module.exports = ItemBase;
