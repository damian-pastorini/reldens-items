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
const ItemsTypes = require('./item/item-types');
const { ErrorManager, sc } = require('@reldens/utils');

class ItemsManager extends Inventory
{

    constructor(props)
    {
        if(!sc.hasOwn(props, 'owner')){
            ErrorManager.error('Undefined owner.');
        }
        super(props);
        this.itemClasses = sc.get(props, 'itemClasses', false);
        this.groupClasses = sc.get(props, 'groupClasses', false);
        this.itemsModelData = sc.get(props, 'itemsModelData', false);
        this.ownerIdProperty = sc.get(props, 'ownerIdProperty', 'id');
        this.owner = props.owner;
        this.groups = {};
        this.eventsPref = this.getOwnerEventKey()+sc.get(props, 'eventsPref', '');
        this.types = new ItemsTypes();
    }

    getOwnerId()
    {
        return this.owner[this.ownerIdProperty];
    }

    getOwnerEventKey()
    {
        return sc.get(this.owner, 'eventsPrefix', '')+this.getOwnerId();
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

    createItemInstance(key, qty)
    {
        let itemData = sc.get(this.itemsModelData, key, false);
        if(false === itemData){
            return false;
        }
        if(itemData['data'].modifiers){
            for(let i of Object.keys(itemData['data'].modifiers)){
                itemData['data'].modifiers[i].target = this.owner;
            }
        }
        let isSingleInstance = itemData['class'].isSingleInstance();
        let definedQuantity = (typeof qty !== 'undefined') && isSingleInstance ? qty : 1;
        let itemProps = Object.assign({}, itemData['data'], {
            manager: this,
            item_id: itemData['data'].id,
            qty: definedQuantity
        });
        delete itemProps['uid'];
        if(isSingleInstance){
            return new itemData['class'](itemProps);
        }
        let createdInstances = [];
        itemProps[qty] = 1;
        for(let i=0; i < qty; i++){
            createdInstances.push(new itemData['class'](itemProps));
        }
        return createdInstances;
    }

}

module.exports = ItemsManager;
