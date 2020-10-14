/**
 *
 * Reldens - Items System - ItemsManager
 *
 */

const { ErrorManager, sc } = require('@reldens/utils');
const Inventory = require('./item/inventory');
const ItemsEvents = require('./items-events');

class ItemsManager extends Inventory
{

    constructor(props)
    {
        super(props);
        if(!sc.hasOwn(props, 'owner')){
            ErrorManager.error('Undefined owner.');
        }
        this.itemClasses = sc.hasOwn(props, 'itemClasses') ? props.itemClasses : false;
        this.groupClasses = sc.hasOwn(props, 'groupClasses') ? props.groupClasses : false;
        this.ownerIdProperty = sc.hasOwn(props, 'ownerIdProperty') ? props.ownerIdProperty : 'id';
        this.owner = props.owner;
        this.groups = {};
    }

    getOwnerId()
    {
        return this.owner[this.ownerIdProperty];
    }

    setup(props)
    {
        this.events.emit(ItemsEvents.MANAGER_INIT, {props: props, manager: this});
        if(sc.hasOwn(props, 'items')){
            this.setItems(props.items);
        }
        if(sc.hasOwn(props, 'groups')){
            this.setGroups(props.groups);
        }
    }

}

module.exports = ItemsManager;
