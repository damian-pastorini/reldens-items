/**
 *
 * Reldens - Items Manager
 *
 */

const { ErrorManager } = require('@reldens/utils');
const Inventory = require('./item/inventory');
const ItemsEvents = require('./items-events');

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

    setup(props)
    {
        this.events.emit(ItemsEvents.MANAGER_INIT, {props: props});
        if({}.hasOwnProperty.call(props, 'items')){
            this.setItems(props.items);
        }
        if({}.hasOwnProperty.call(props, 'groups')){
            this.setItems(props.groups);
        }
    }

    setItems(items)
    {
        this.items = items;
        this.events.emit(ItemsEvents.SET_ITEMS, {items: items});
    }

    setGroups(groups)
    {
        this.groups = groups;
        this.events.emit(ItemsEvents.SET_GROUPS, {groups: groups});
    }

}

module.exports = ItemManager;
