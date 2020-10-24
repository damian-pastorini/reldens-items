/**
 *
 * Reldens - Items System - ItemUsable
 *
 * Basically a shortcut class for single instance usable items (just note this extends ItemUsable).
 * This type behaves in the inventory like the single item type, see /lib/item/type/single.js for further explanation.
 *
 */

const ItemUsable = require('./usable');

class SingleUsable extends ItemUsable
{

    constructor(props)
    {
        super(props);
        this.singleInstance = true;
    }

}

module.exports = SingleUsable;
