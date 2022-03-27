/**
 *
 * Reldens - Items System - StorageObserver
 *
 * This class listen for all the inventory actions and process the information to persist it in the storage.
 * This implements the models manager to avoid having an specific driver calls here: the default models manager uses
 * Objection JS but this could be change for a different / custom models manager.
 *
 */

const { Modifier, ModifierConst } = require('@reldens/modifiers');
const { ModelsManager } = require('./storage/models-manager');
const ItemsConst = require('../constants');
const ItemsEvents = require('../items-events');
const { sc } = require('@reldens/utils');

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
        let items = await this.modelsManager.loadOwnerItems(this.manager.getOwnerId());
        if(!items.length){
            return false;
        }
        let itemsInstances = {};
        for(let item of items){
            let itemObj = this.createFromModel(item);
            itemsInstances[itemObj.getInventoryId()] = itemObj;
        }
        await this.manager.fireEvent(ItemsEvents.LOADED_OWNER_ITEMS, this, itemsInstances, items);
        await this.manager.setItems(itemsInstances);
    }

    createFromModel(item)
    {
        let itemClass = sc.get(
            this.manager.itemClasses,
            item.items_item.key,
            this.manager.types.classByTypeId(item.items_item.type)
        );
        let itemProps = {
            id: item.id,
            key: item.items_item.key,
            type_id: item.items_item.type,
            manager: this.manager,
            label: item.items_item.label,
            description: item.items_item.description,
            qty: item.qty,
            remaining_uses: item.remaining_uses,
            is_active: item.is_active,
            group_id: item.items_item.group_id,
            qty_limit: item.items_item.qty_limit,
            uses_limit: item.items_item.uses_limit,
            useTimeOut: item.items_item.useTimeOut,
            execTimeOut: item.items_item.execTimeOut
        };
        let itemObj = new itemClass(itemProps);
        if (itemObj.isType(ItemsConst.TYPE_EQUIPMENT)) {
            itemObj.equipped = (item.is_active === 1);
        }
        this.enrichWithModifiers(item, itemObj);
        return itemObj;
    }

    enrichWithModifiers(item, itemObj)
    {
        if(0 === item.items_item.items_modifiers.length){
            return;
        }
        let modifiers = {};
        for(let modifierData of item.items_item.items_modifiers){
            if(modifierData.operation !== ModifierConst.OPS.SET){
                modifierData.value = Number(modifierData.value);
            }
            modifierData.target = this.manager.owner;
            modifiers[modifierData.id] = new Modifier(modifierData);
        }
        itemObj.modifiers = modifiers;
    }

    getMasterKey()
    {
        return this.manager.getOwnerEventKey();
    }

}

module.exports.StorageObserver = StorageObserver;
