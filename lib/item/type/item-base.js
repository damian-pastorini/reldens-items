/**
 *
 * Reldens - Items System - ItemBase
 *
 */

const { Logger, ErrorManager } = require('@reldens/utils');
const ItemsConst = require('../../constants');
const ItemsEvents = require('../../items-events');

class ItemBase
{

    constructor(props)
    {
        if(!{}.hasOwnProperty.call(props, 'key')){
            ErrorManager.error('Undefined item key.');
        }
        if(!{}.hasOwnProperty.call(props, 'manager')){
            ErrorManager.error('Undefined item manager.');
        }
        this.key = props.key;
        this.label = props.label || props.key;
        this.description = props.description || '';
        this.manager = props.manager;
        this.type = ItemsConst.TYPE_BASE;
        this.qty = {}.hasOwnProperty.call(props, 'qty') ? props.qty : 0;
        this.modifiers = {}.hasOwnProperty.call(props, 'modifiers') ? props.modifiers : {};
        this.target = false;
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
            let ownerProperty = this.getOwnerProperty(modifier.property);
            let newValue = this.modifyValue(modifier, ownerProperty, revert);
            this.setOwnerProperty(modifier.property, newValue);
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
            if(!{}.hasOwnProperty.call(this, modifier.value) || typeof props[modifier.value] !== 'function'){
                Logger.error(['Item modifier error:', this.key, 'Undefined method:', modifier.value]);
            } else {
                ownerProperty = this[modifier.value](modifier, ownerProperty);
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
        return obj;
    }

}

module.exports = ItemBase;
