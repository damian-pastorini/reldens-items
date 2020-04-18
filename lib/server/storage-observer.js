/**
 *
 * Reldens - Items System - StorageObserver
 *
 */

const { ModelsManager } = require('./storage/models-manager');
const ItemBase = require('../item/type/item-base');
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
            return this.modelsManager.onAddItem(inventory, item);
        });
        this.manager.events.on(ItemsEvents.REMOVE_ITEM, async (inventory, item) => {
            return this.modelsManager.onRemoveItem(inventory, item);
        });
        this.manager.events.on(ItemsEvents.MODIFY_ITEM_QTY, async (item, inventory, op, key, qty) => {
            return this.modelsManager.onModifyItemQty(item, inventory, op, key, qty);
        });
        this.manager.events.on(ItemsEvents.EQUIP_ITEM, async (item) => {
            return this.modelsManager.onEquipItem(item);
        });
        this.manager.events.on(ItemsEvents.UNEQUIP_ITEM, async (item) => {
            return this.modelsManager.onUnequipItem(item);
        });
        // @NOTE: check Item class changeModifiers method.
        this.manager.events.on(ItemsEvents.EQUIP+'AppliedModifiers', async (item) => {
            return this.modelsManager.onChangedModifiers(item, ItemsConst.MOD_APPLIED);
        });
        this.manager.events.on(ItemsEvents.EQUIP+'RevertedModifiers', async (item) => {
            return this.modelsManager.onChangedModifiers(item, ItemsConst.MOD_REVERTED);
        });
        this.manager.events.on(ItemsEvents.EXECUTED_ITEM, async (inventory, item) => {
            return this.modelsManager.onExecutedItem(inventory, item);
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
            if(this.manager.itemClasses && {}.hasOwnProperty.call(this.manager.itemClasses, item.items_item.key)){
                itemClass = this.manager.itemClasses[item.items_item.key];
            }
            let itemProps = {
                key: item.items_item.key,
                manager: this.manager,
                label: item.items_item.label,
                qty: item.qty
            };
            let itemObj = new itemClass(itemProps);
            itemObj.id = item.id;
            itemsInstances[item.items_item.key] = itemObj;
        }
        await this.manager.events.emit(ItemsEvents.LOADED_OWNER_ITEMS, this, itemsInstances, items);
        this.manager.setItems(itemsInstances);
    }

}

module.exports.StorageObserver = StorageObserver;
