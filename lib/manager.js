
const { ErrorManager } = require('@reldens/utils');
const Inventory = require('./item/inventory');

class ItemManager extends Inventory
{

    constructor(props)
    {
        super(props);
        if(!{}.hasOwnProperty.call(props, 'owner')){
            ErrorManager.error('Undefined owner.');
        }
        this.owner = props.owner;
        this.groups = {};
    }

}

module.exports = ItemManager;
