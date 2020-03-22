
const { Logger } = require('@reldens/utils');
const { Item } = require('./item');

class Equipment extends Item
{

    constructor(props)
    {
        super(props);
        this.equipped = {}.hasOwnProperty.call(props, 'equipped') ? props.equipped : false;
        this.manager.events.on('reldens.itemManagerEquip', this.equip.bind(this));
    }

    async equip()
    {
        await this.events.emit('reldens.equipItem', this);
        this.equipped = true;
    }

    async unequip()
    {
        await this.events.emit('reldens.unequipItem', this);
        this.equipped = true;
    }

    async applyModifiers()
    {
        if(!this.equipped){
            Logger.error('Item not equipped: '+this.key);
            return false;
        }
        return await super.applyModifiers();
    }

}

module.exports.Equipment = Equipment;
