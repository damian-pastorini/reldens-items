/**
 *
 * Reldens - Items System - Equipment
 *
 */

const { Logger, sc } = require('@reldens/utils');
const ItemBase = require('./item-base');
const ItemsConst = require('../../constants');
const ItemsEvents = require('../../items-events');

class Equipment extends ItemBase
{

    constructor(props)
    {
        super(props);
        this.type = ItemsConst.TYPE_EQUIPMENT;
        this.equipped = sc.hasOwn(props, 'equipped') ? props.equipped : false;
    }

    async equip(applyMods)
    {
        this.equipped = true;
        await this.manager.events.emit(ItemsEvents.EQUIP_ITEM, this);
        // apply modifiers automatically or not:
        if(applyMods === false || this.manager.applyModifiersAuto === false){
            return false;
        }
        await this.applyModifiers();
    }

    async unequip(revertMods)
    {
        this.equipped = false;
        await this.manager.events.emit(ItemsEvents.UNEQUIP_ITEM, this);
        // revert modifiers automatically or not:
        if(revertMods === false || this.manager.revertModifiersAuto === false){
            return false;
        }
        await this.revertModifiers();
    }

    async applyModifiers()
    {
        if(!this.equipped){
            Logger.error('Item not equipped: '+this.getInventoryId());
            return false;
        }
        return await super.applyModifiers();
    }

    async revertModifiers()
    {
        if(this.equipped){
            Logger.error('Item equipped: '+this.getInventoryId());
            return false;
        }
        return await super.revertModifiers();
    }

}

module.exports = Equipment;
