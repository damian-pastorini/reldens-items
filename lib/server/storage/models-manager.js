/**
 *
 * Reldens - Items System - ModelsManager
 *
 * This class contains all the Objection models examples so we can have a single entry point for all of them and
 * additionally get shortcuts to process the information from the events and run the proper actions in the storage.
 *
 */

const { DataServerValidator } = require('../data-server-validator');
const ItemsEvents = require('../../items-events');
const { sc } = require('@reldens/utils');

class ModelsManager
{

    constructor(props)
    {
        this.dataServer = DataServerValidator.getValidDataServer(props, this);
    }
    
    getEntity(entityName)
    {
        return this.dataServer.entityManager.get(entityName);
    }

    async loadOwnerItems(ownerId)
    {
        return this.getEntity('inventory').loadByWithRelations('owner_id', ownerId, ['items_item.items_modifiers']);
    }

    async onAddItem(inventory, item)
    {
        let itemData = {
            id: null, // id will be always null for new items since it's an auto-increment in the storage.
            owner_id: inventory.getOwnerId(),
            item_id: item.item_id,
            qty: item.qty
        };
        if(sc.hasOwn(item, 'remaining_uses')){
            itemData.remaining_uses = item.remaining_uses;
        }
        if(sc.hasOwn(item, 'is_active')){
            itemData.is_active = item.is_active;
        }
        let itemModel = await this.getEntity('inventory').create(itemData);
        item.id = itemModel.id;
        return item;
    }

    async onRemoveItem(inventory, itemKey)
    {
        return this.getEntity('inventory').deleteById(inventory.items[itemKey].id);
    }

    // eslint-disable-next-line no-unused-vars
    async onModifyItemQty(item, inventory, op, key, qty)
    {
        return this.getEntity('inventory').updateById(item.id, {qty: item.qty});
    }

    async onEquipItem(item)
    {
        return this.getEntity('inventory').updateById(item.id, {is_active: 1});
    }

    async onUnequipItem(item)
    {
        return this.getEntity('inventory').updateById(item.id, {is_active: 0});
    }

    async onChangedModifiers(item, action)
    {
        // owners will persist their own data after the modifiers were applied:
        return item.manager.owner.persistData({act: action, item: item});
    }

    async onExecutedItem(item)
    {
        if(item.uses === 0){
            await this.getEntity('inventory').deleteById(item.id);
        }
        return item.manager.owner.persistData({act: ItemsEvents.EXECUTED_ITEM, item: item});
    }

}

module.exports.ModelsManager = ModelsManager;
