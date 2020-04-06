
const { Logger } = require('@reldens/utils');
const Item = require('./item');
const ItemsConst = require('../../constants');
const ItemsEvents = require('../../items-events');

class Equipment extends Item
{

    constructor(props)
    {
        super(props);
        this.type = ItemsConst.TYPE_EQUIPMENT;
        this.equipped = {}.hasOwnProperty.call(props, 'equipped') ? props.equipped : false;
    }

    async equip(applyMods)
    {
        await this.events.emit(ItemsEvents.EQUIP_ITEM, this);
        // apply modifiers automatically by default:
        if(applyMods !== false){
            this.equipped = true;
        }
        await this.applyModifiers();
    }

    async unequip(revertMods)
    {
        await this.events.emit(ItemsEvents.UNEQUIP_ITEM, this);
        // revert modifiers automatically by default:
        if(revertMods !== false){
            await this.revertModifiers();
        }
        this.equipped = false;
    }

    async applyModifiers()
    {
        if(!this.equipped){
            Logger.error('Item not equipped: '+this.key);
            return false;
        }
        return await super.applyModifiers();
    }

    async revertModifiers()
    {
        if(!this.equipped){
            Logger.error('Item not equipped: '+this.key);
            return false;
        }
        return await super.revertModifiers();
    }

}

module.exports = Equipment;
