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
