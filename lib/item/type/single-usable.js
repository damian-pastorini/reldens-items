/**
 *
 * Reldens - Items System - ItemUsable
 * Basically a shortcut class for single instance usable items.
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
