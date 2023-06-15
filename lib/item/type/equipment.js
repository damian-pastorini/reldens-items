/**
 *
 * Reldens - Items System - Equipment
 *
 * This item type has some specific actions for equip/unequip item that will run/revert the item modifiers.
 * For example: if the item has a modifier for the property atk + 3p, and the owner atk property = 100p, when the owner
 * equips the item the atk will be 103p.
 *
 */

const ItemBase = require('./item-base');
const ItemsConst = require('../../constants');
const ItemsEvents = require('../../items-events');
const { Logger, sc } = require('@reldens/utils');

class Equipment extends ItemBase
{

    constructor(props)
    {
        super(props);
        this.type = ItemsConst.TYPES.EQUIPMENT;
        this.equipped = sc.get(props, 'equipped', false);
    }

    async equip(applyMods)
    {
        this.equipped = true;
        await this.manager.fireEvent(ItemsEvents.EQUIP_ITEM, this);
        // apply modifiers automatically or not:
        if(applyMods === false || this.manager.applyModifiersAuto === false){
            return false;
        }
        await this.applyModifiers();
    }

    async unequip(revertMods)
    {
        this.equipped = false;
        await this.manager.fireEvent(ItemsEvents.UNEQUIP_ITEM, this);
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
