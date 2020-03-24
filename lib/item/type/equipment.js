
const { Logger } = require('@reldens/utils');
const Item = require('./item');
const ItemsConst = require('../../constants');

class Equipment extends Item
{

    constructor(props)
    {
        super(props);
        this.type = ItemsConst.TYPE_EQUIPMENT;
        this.equipped = {}.hasOwnProperty.call(props, 'equipped') ? props.equipped : false;
        this.manager.events.on('reldens.itemManagerEquip', this.equip.bind(this));
    }

    async equip()
    {
        await this.events.emit('reldens.equipItem', this);
        this.equipped = true;
        await this.applyModifiers();
    }

    async unequip()
    {
        await this.events.emit('reldens.unequipItem', this);
        await this.revertModifiers();
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
