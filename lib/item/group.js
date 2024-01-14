/**
 *
 * Reldens - Items System - ItemGroup
 *
 * Item groups is just a way to do exactly that, group items by some key and handle them like if they were in a new
 * inventory instance. For example, you could have some limits specified in your general inventory, but then assign
 * the item to a specific group and set a lower limit for the qty.
 * Some example use cases could be different items for different bags, or just simple categorization, let's say you
 * have equipment and use items that you would like to handle in different places.
 *
 */

const Inventory = require('./inventory');
const { ErrorManager, sc } = require('@reldens/utils');

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
        props.eventsPref = 'g'+props.key+'.'+sc.get(props, 'eventsPrefix', '');
        super(props);
        this.id = props.id;
        this.key = props.key;
        this.label = sc.get(props, 'label', false);
        this.description = sc.get(props, 'description', false);
        this.files_name = sc.get(props, 'files_name', false);
        this.sort = sc.get(props, 'sort', false);
        this.items_limit = sc.get(props, 'items_limit', false);
        this.limit_per_item = sc.get(props, 'limit_per_item', false);
    }

}

module.exports = ItemGroup;
