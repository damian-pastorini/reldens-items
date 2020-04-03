const { DataServer } = require('@reldens/storage');
const { ItemModel } = require('./models/item');
const { GroupModel } = require('./models/group');
const { InventoryModel } = require('./models/inventory');

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

    async onAddItem(inventory, item)
    {
        await this.models['inventory'].query().insert(item);
    }

    async onRemoveItem(inventory, itemKey)
    {
        await this.models['inventory'].query().where('key', itemKey).delete();
    }

    async onModifyItemQty(item, op, key, qty)
    {
        await this.models['inventory'].query().update(item);
    }

    async onEquipItem(item)
    {
        await this.models['inventory'].query().update(item);
    }

    async onUnequipItem(item)
    {
        await this.models['inventory'].query().update(item);
    }

    async onChangedModifiers(item, action)
    {
        // owners will persist their own data after the modifiers were applied:
        await item.manager.owner.persistData(item, action);
    }

    async onExecutedItem(item)
    {
        if(item.uses === 0){
            await this.models['inventory'].query().where('id', item.id).delete();
        }
        await item.manager.owner.persistData(item);
    }

}

module.exports.ModelsManager = ModelsManager;