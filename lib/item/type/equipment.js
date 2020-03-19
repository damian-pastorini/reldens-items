
const { Logger } = require('@reldens/utils');
const { Item } = require('./item');

class Equipment extends Item
{

    constructor(props)
    {
        super(props);
        this.equipped = {}.hasOwnProperty.call(props, 'equipped') ? props.equipped : false;
        this.modifiers = {}.hasOwnProperty.call(props, 'modifiers') ? props.modifiers : {};
        this.manager.events.on('reldens.itemManagerEquip', this.equip.bind(this));
    }

    async equip()
    {
        await this.events.emit('reldens.equipItem', this);
        this.equipped = true;
    }

    async applyModifiers()
    {
        if(!this.equipped){
            Logger.error('Item not equipped: '+this.key);
            return false;
        }
        await this.events.emit('reldens.equipApplyModifiers', this);
        for(let idx in this.modifiers){
            let modifier = this.modifiers[idx];
            Object.assign(this.manager.owner, modifier);
        }
    }

}

module.exports.Equipment = Equipment;
