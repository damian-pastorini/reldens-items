
const { ModelsManager } = require('./storage/models-manager');
const ItemsConst = require('../constants');
const ItemsEvents = require('../items-events');

class StorageObserver
{

    constructor(manager, modelsManager = false)
    {
        this.manager = manager;
        if(modelsManager){
            this.modelsManager = modelsManager;
        } else {
            this.modelsManager = new ModelsManager();
        }
    }

    listenEvents()
    {
        this.manager.events.on(ItemsEvents.ADD_ITEM, async (inventory, item) => {
            await this.modelsManager.onAddItem(inventory, item);
        });
        this.manager.events.on(ItemsEvents.REMOVE_ITEM, async (inventory, item) => {
            await this.modelsManager.onRemoveItem(inventory, item);
        });
        this.manager.events.on(ItemsEvents.MODIFY_ITEM_QTY, async (item, op, key, qty) => {
            await this.modelsManager.onModifyItemQty(item, op, key, qty);
        });
        this.manager.events.on(ItemsEvents.EQUIP_ITEM, async (item) => {
            await this.modelsManager.onEquipItem(item);
        });
        this.manager.events.on(ItemsEvents.UNEQUIP_ITEM, async (item) => {
            await this.modelsManager.onUnequipItem(item);
        });
        // @NOTE: check Item class changeModifiers method.
        this.manager.events.on(ItemsEvents.EQUIP+'AppliedModifiers', async (item) => {
            await this.modelsManager.onChangedModifiers(item, ItemsConst.MOD_APPLIED);
        });
        this.manager.events.on(ItemsEvents.EQUIP+'RevertedModifiers', async (item) => {
            await this.modelsManager.onChangedModifiers(item, ItemsConst.MOD_REVERTED);
        });
        this.manager.events.on(ItemsEvents.EXECUTED_ITEM, async (inventory, item) => {
            await this.modelsManager.onExecutedItem(inventory, item);
        });
    }

}

module.exports.StorageObserver = StorageObserver;
