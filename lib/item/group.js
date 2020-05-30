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
        if(!{}.hasOwnProperty.call(props, 'id')){
            ErrorManager.error('Undefined ItemGroup id.');
        }
        if(!{}.hasOwnProperty.call(props, 'key')){
            ErrorManager.error('Undefined ItemGroup key.');
        }
        props.eventsPref = 'g'+props.key;
        super(props);
        this.id = props.id;
        this.key = props.key;
        this.label = {}.hasOwnProperty.call(props, 'label') ? props.label : false;
        this.description = {}.hasOwnProperty.call(props, 'description') ? props.description : false;
        this.sort = {}.hasOwnProperty.call(props, 'sort') ? props.sort : false;
        this.items_limit = {}.hasOwnProperty.call(props, 'items_limit') ? props.items_limit : false;
        this.limit_per_item = {}.hasOwnProperty.call(props, 'limit_per_item') ? props.limit_per_item : false;
    }

}

module.exports = ItemGroup;
