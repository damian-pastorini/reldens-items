/**
 *
 * Reldens - Items System - SingleEquipment
 * Basically a shortcut class for single instance equipment items.
 *
 */

const ItemEquipment = require('./equipment');

class SingleEquipment extends ItemEquipment
{

    constructor(props)
    {
        super(props);
        this.singleInstance = true;
    }

}

module.exports = SingleEquipment;
