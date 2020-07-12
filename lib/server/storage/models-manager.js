/**
 *
 * Reldens - Items System - ModelsManager
 *
 */

const { DataServer } = require('@reldens/storage');
const { ItemModel } = require('./models/item');
const { GroupModel } = require('./models/group');
const { InventoryModel } = require('./models/inventory');
const ItemsEvents = require('../../items-events');

class ModelsManager
{

    constructor()
    {
        this.dataServer = DataServer;
        if(!DataServer.initialized){
            DataServer.initialize();
        }
        this.models = {
            item: ItemModel,
            group: GroupModel,
            inventory: InventoryModel
        };
    }

    async loadOwnerItems(ownerId)
    {
        return this.models['inventory'].query().where('owner_id', ownerId).withGraphFetched('[items_item]');
    }

    async onAddItem(inventory, item)
    {
        let itemData = {
            id: null, // id will be always null for new items since it's an auto-increment in the storage.
            owner_id: inventory.getOwnerId(),
            item_id: item.item_id,
            qty: item.qty
        };
        if({}.hasOwnProperty.call(item, 'remaining_uses')){
            itemData.remaining_uses = item.remaining_uses;
        }
        if({}.hasOwnProperty.call(item, 'is_active')){
            itemData.is_active = item.is_active;
        }
        let itemModel = await this.models['inventory'].query().insert(itemData);
        item.id = itemModel.id;
        return item;
    }

    async onRemoveItem(inventory, itemKey)
    {
        return this.models['inventory'].query().where('id', inventory.items[itemKey].id).delete();
    }

    // eslint-disable-next-line no-unused-vars
    async onModifyItemQty(item, inventory, op, key, qty)
    {
        return this.models['inventory'].query().patch({qty: item.qty}).findById(item.id);
    }

    async onEquipItem(item)
    {
        return this.models['inventory'].query().patch({is_active: 1}).findById(item.id);
    }

    async onUnequipItem(item)
    {
        return this.models['inventory'].query().patch({is_active: 0}).findById(item.id);
    }

    async onChangedModifiers(item, action)
    {
        // owners will persist their own data after the modifiers were applied:
        return item.manager.owner.persistData({act: action, item: item});
    }

    async onExecutedItem(item)
    {
        if(item.uses === 0){
            await this.models['inventory'].query().findById(item.id).delete();
        }
        return item.manager.owner.persistData({act: ItemsEvents.EXECUTED_ITEM, item: item});
    }

}

module.exports.ModelsManager = ModelsManager;