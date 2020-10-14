/**
 *
 * Reldens - Items System - ItemGroup
 *
 */

const { ErrorManager, sc } = require('@reldens/utils');
const Inventory = require('./inventory');

class ItemGroup extends Inventory
{

    constructor(props)
    {
        if(!sc.hasOwn(props, 'id')){
            ErrorManager.error('Undefined ItemGroup id.');
        }
        if(!sc.hasOwn(props, 'key')){
            ErrorManager.error('Undefined ItemGroup key.');
        }
        props.eventsPref = 'g'+props.key;
        super(props);
        this.id = props.id;
        this.key = props.key;
        this.label = sc.hasOwn(props, 'label') ? props.label : false;
        this.description = sc.hasOwn(props, 'description') ? props.description : false;
        this.sort = sc.hasOwn(props, 'sort') ? props.sort : false;
        this.items_limit = sc.hasOwn(props, 'items_limit') ? props.items_limit : false;
        this.limit_per_item = sc.hasOwn(props, 'limit_per_item') ? props.limit_per_item : false;
    }

}

module.exports = ItemGroup;
