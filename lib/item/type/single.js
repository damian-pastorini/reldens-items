/**
 *
 * Reldens - Items System - ItemSingle
 * Basically a shortcut class for single instance items.
 *
 */

const ItemBase = require('./item-base');

class ItemSingle extends ItemBase
{

    constructor(props)
    {
        super(props);
        this.singleInstance = true;
    }

}

module.exports = ItemSingle;
