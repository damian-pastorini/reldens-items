
const { ItemsConst } = require('../../constants');

class Item
{

    constructor(props)
    {
        this.key = false;
        this.type = ItemsConst.TYPE_BASE;
        this.manager = false;
        this.qty = 0;
        Object.assign(this, props);
    }

}

module.exports.Item = Item;
