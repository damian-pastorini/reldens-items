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
        this.dataServer.initialize();
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
        return this.models['inventory'].query().insert(item);
    }

    async onRemoveItem(inventory, itemKey)
    {
        return this.models['inventory'].query().where('key', itemKey).delete();
    }

    async onModifyItemQty(item, op, key, qty)
    {
        return this.models['inventory'].query().patch(item).findById(item.id);
    }

    async onEquipItem(item)
    {
        return this.models['inventory'].query().patch(item).findById(item.id);
    }

    async onUnequipItem(item)
    {
        return this.models['inventory'].query().patch(item).findById(item.id);
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