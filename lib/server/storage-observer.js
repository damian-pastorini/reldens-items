/**
 *
 * Reldens - Items System - StorageObserver
 *
 */

const { Modifier, ModifierConst } = require('@reldens/modifiers');
const { ModelsManager } = require('./storage/models-manager');
const ItemBase = require('../item/type/item-base');
const ItemsConst = require('../constants');
const ItemsEvents = require('../items-events');
const { sc } = require('@reldens/utils');

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
        let ownerId = this.manager.getOwnerId();
        this.manager.events.on(ItemsEvents.ADD_ITEM_BEFORE, async (inventory, item) => {
            if(ownerId !== item.manager.getOwnerId()){
                return false;
            }
            return this.modelsManager.onAddItem(inventory, item);
        });
        this.manager.events.on(ItemsEvents.REMOVE_ITEM, async (inventory, itemKey) => {
            if(ownerId !== inventory.items[itemKey].manager.getOwnerId()){
                return false;
            }
            return this.modelsManager.onRemoveItem(inventory, itemKey);
        });
        this.manager.events.on(ItemsEvents.MODIFY_ITEM_QTY, async (item, inventory, op, key, qty) => {
            if(ownerId !== item.manager.getOwnerId()){
                return false;
            }
            return this.modelsManager.onModifyItemQty(item, inventory, op, key, qty);
        });
        this.manager.events.on(ItemsEvents.EQUIP_ITEM, async (item) => {
            if(ownerId !== item.manager.getOwnerId()){
                return false;
            }
            return this.modelsManager.onEquipItem(item);
        });
        this.manager.events.on(ItemsEvents.UNEQUIP_ITEM, async (item) => {
            if(ownerId !== item.manager.getOwnerId()){
                return false;
            }
            return this.modelsManager.onUnequipItem(item);
        });
        // @NOTE: check Item class changeModifiers method.
        this.manager.events.on(ItemsEvents.EQUIP+'AppliedModifiers', async (item) => {
            if(ownerId !== item.manager.getOwnerId()){
                return false;
            }
            return this.modelsManager.onChangedModifiers(item, ModifierConst.MOD_APPLIED);
        });
        this.manager.events.on(ItemsEvents.EQUIP+'RevertedModifiers', async (item) => {
            if(ownerId !== item.manager.getOwnerId()){
                return false;
            }
            return this.modelsManager.onChangedModifiers(item, ModifierConst.MOD_REVERTED);
        });
        this.manager.events.on(ItemsEvents.EXECUTED_ITEM, async (item) => {
            if(ownerId !== item.manager.getOwnerId()){
                return false;
            }
            return this.modelsManager.onExecutedItem(item);
        });
    }

    async loadOwnerItems()
    {
        let items = await this.modelsManager.loadOwnerItems(this.manager.getOwnerId());
        if(!items.length){
            return false;
        }
        let itemsInstances = {};
        for(let item of items){
            let itemClass = ItemBase;
            if(this.manager.itemClasses && sc.hasOwn(this.manager.itemClasses, item.items_item.key)){
                itemClass = this.manager.itemClasses[item.items_item.key];
            }
            let itemProps = {
                id: item.id,
                key: item.items_item.key,
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
            if(itemObj.isType(ItemsConst.TYPE_EQUIPMENT)){
                itemObj.equipped = (item.is_active === 1);
            }
            if(item.items_item.items_modifiers){
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
            itemsInstances[itemObj.getInventoryId()] = itemObj;
        }
        await this.manager.events.emit(ItemsEvents.LOADED_OWNER_ITEMS, this, itemsInstances, items);
        this.manager.setItems(itemsInstances);
    }

}

module.exports.StorageObserver = StorageObserver;
