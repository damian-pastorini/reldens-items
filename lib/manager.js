/**
 *
 * Reldens - Items System - ItemsManager
 *
 * This is just an extension of the Inventory class to add some extra features and allow developers to keep using the
 * base one without all these extras.
 *
 * Between the extra features you will find the groups and the items classes
 *
 */

const Inventory = require('./item/inventory');
const ItemsEvents = require('./items-events');
const { ErrorManager, sc } = require('@reldens/utils');

class ItemsManager extends Inventory
{

    constructor(props)
    {
        if(!sc.hasOwn(props, 'owner')){
            ErrorManager.error('Undefined owner.');
        }
        super(props);
        this.itemClasses = sc.getDef(props, 'itemClasses', false);
        this.groupClasses = sc.getDef(props, 'groupClasses', false);
        this.ownerIdProperty = sc.getDef(props, 'ownerIdProperty', 'id');
        this.owner = props.owner;
        this.groups = {};
        this.eventsPref = this.getOwnerEventKey()+sc.getDef(props, 'eventsPref', '');
    }

    getOwnerId()
    {
        return this.owner[this.ownerIdProperty];
    }

    getOwnerEventKey()
    {
        return sc.getDef(this.owner, 'eventsPrefix', '')+this.getOwnerId();
    }

    async setup(props)
    {
        await this.fireEvent(ItemsEvents.MANAGER_INIT, {props: props, manager: this});
        if(sc.hasOwn(props, 'items')){
            await this.setItems(props.items);
        }
        if(sc.hasOwn(props, 'groups')){
            await this.setGroups(props.groups);
        }
    }

}

module.exports = ItemsManager;
