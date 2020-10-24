/**
 *
 * Reldens - Items System - ItemGroup
 *
 * Items groups is just a way to do exactly that, group items by some key and handle them like if they where in a new
 * inventory instance. For example, you could have some limits specified in your general inventory, but then assign
 * the item to an specific group and set a lower limit for the qty.
 * Some example use cases could be different items for different bags, or just simple categorization, let's say you
 * have equipment and use items that you would like to handle in different places.
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
        props.eventsPref = 'g'+props.key+'.'+(sc.hasOwn(props, 'eventsPref') ? props.eventsPref : '');
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
