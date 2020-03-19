
const { ItemsConst } = require('../../constants');
const { ErrorManager } = require('@reldens/utils');

class Item
{

    constructor(props)
    {
        if(!{}.hasOwnProperty.call(props, 'key')){
            ErrorManager.error('Undefined item key.');
        }
        if(!{}.hasOwnProperty.call(props, 'manager')){
            ErrorManager.error('Undefined item manager.');
        }
        this.key = props.key;
        this.manager = props.manager;
        this.type = ItemsConst.TYPE_BASE;
        this.qty = {}.hasOwnProperty.call(props, 'qty') ? props.qty : 0;
    }

}

module.exports.Item = Item;
