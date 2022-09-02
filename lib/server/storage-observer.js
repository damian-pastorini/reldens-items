/**
 *
 * Reldens - Items System - StorageObserver
 *
 * This class listen for all the inventory actions and process the information to persist it in the storage.
 * This implements the models manager to avoid having a specific driver calls: the default models manager uses
 * Objection JS but this could be change for a different custom models manager.
 *
 */

const { ModifierConst } = require('@reldens/modifiers');
const { ModelsManager } = require('./storage/models-manager');
const ItemsFactory = require('../items-factory');
const ItemsEvents = require('../items-events');

class StorageObserver
{

    constructor(manager, modelsManager = false)
    {
        this.manager = manager;
        this.modelsManager = false !== modelsManager ? modelsManager : new ModelsManager();
        if(false === this.modelsManager.dataServer.initialized){
            this.modelsManager.dataServer.connect();
        }
    }

    listenEvents()
    {
        this.manager.listenEvent(ItemsEvents.ADD_ITEM_BEFORE, async (inventory, item) => {
            return this.modelsManager.onAddItem(inventory, item);
        }, 'addItemBeforeStore', this.getMasterKey());
        this.manager.listenEvent(ItemsEvents.REMOVE_ITEM, async (inventory, itemKey) => {
            return this.modelsManager.onRemoveItem(inventory, itemKey);
        }, 'removeItemStore', this.getMasterKey());
        this.manager.listenEvent(ItemsEvents.MODIFY_ITEM_QTY, async (item, inventory, op, key, qty) => {
            return this.modelsManager.onModifyItemQty(item, inventory, op, key, qty);
        }, 'modifyItemStore', this.getMasterKey());
        this.manager.listenEvent(ItemsEvents.EQUIP_ITEM, async (item) => {
            return this.modelsManager.onEquipItem(item);
        }, 'equipItemStore', this.getMasterKey());
        this.manager.listenEvent(ItemsEvents.UNEQUIP_ITEM, async (item) => {
            return this.modelsManager.onUnequipItem(item);
        }, 'unequipItemStore', this.getMasterKey());
        // @NOTE: check Item class changeModifiers method.
        this.manager.listenEvent(ItemsEvents.EQUIP+'AppliedModifiers', async (item) => {
            return this.modelsManager.onChangedModifiers(item, ModifierConst.MOD_APPLIED);
        }, 'modifiersAppliedStore', this.getMasterKey());
        this.manager.listenEvent(ItemsEvents.EQUIP+'RevertedModifiers', async (item) => {
            return this.modelsManager.onChangedModifiers(item, ModifierConst.MOD_REVERTED);
        }, 'modifiersRevertedStore', this.getMasterKey());
        this.manager.listenEvent(ItemsEvents.EXECUTED_ITEM, async (item) => {
            return this.modelsManager.onExecutedItem(item);
        }, 'executedItemStore', this.getMasterKey());
    }

    async loadOwnerItems()
    {
        let itemsModels = await this.modelsManager.loadOwnerItems(this.manager.getOwnerId());
        if(0 === itemsModels.length){
            return false;
        }
        let itemsInstances = await ItemsFactory.fromModelsList(itemsModels, this.manager);
        if(false === itemsInstances){
            return false;
        }
        await this.manager.fireEvent(ItemsEvents.LOADED_OWNER_ITEMS, this, itemsInstances, itemsModels);
        await this.manager.setItems(itemsInstances);
    }

    getMasterKey()
    {
        return this.manager.getOwnerEventKey();
    }

}

module.exports.StorageObserver = StorageObserver;
