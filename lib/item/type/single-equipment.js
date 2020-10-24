/**
 *
 * Reldens - Items System - SingleEquipment
 *
 * Basically a shortcut class for single instance equipment items (just note this extends from ItemEquipment).
 * This type behaves in the inventory like the single item type, see /lib/item/type/single.js for further explanation.
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
