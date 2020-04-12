/**
 *
 * Reldens - Items System - ItemGroup
 *
 */

const { ErrorManager } = require('@reldens/utils');
const Inventory = require('./inventory');

class ItemGroup extends Inventory
{

    constructor(props)
    {
        super(props);
        if(!{}.hasOwnProperty.call(props, 'key')){
            ErrorManager.error('Undefined ItemGroup key.');
        }
        this.key = props.key;
    }

}

module.exports = ItemGroup;
