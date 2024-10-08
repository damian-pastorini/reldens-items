/**
 *
 * Reldens - ItemsFactory
 *
 */

const ItemsConst = require('./constants');
const { ModifierConst, Modifier } = require('@reldens/modifiers');
const { sc } = require('@reldens/utils');

class ItemsFactory
{

    static async fromModelsList(itemsModels, manager)
    {
        if(!itemsModels.length){
            return false;
        }
        let itemsInstances = {};
        for(let item of itemsModels){
            let itemObj = await this.fromModel(item, manager);
            itemsInstances[itemObj.getInventoryId()] = itemObj;
        }
        return itemsInstances;
    }

    static async fromModel(itemModel, manager)
    {
        let itemClass = sc.get(
            manager.itemClasses,
            itemModel.items_item.key,
            manager.types.classByTypeId(itemModel.items_item.type)
        );
        let itemProps = {
            id: itemModel.id,
            item_id: itemModel.items_item.id,
            key: itemModel.items_item.key,
            type: itemModel.items_item.type,
            manager: manager,
            label: itemModel.items_item.label,
            description: itemModel.items_item.description,
            qty: itemModel.qty,
            remaining_uses: itemModel.remaining_uses,
            is_active: itemModel.is_active,
            group_id: itemModel.items_item.group_id,
            qty_limit: itemModel.items_item.qty_limit,
            uses_limit: itemModel.items_item.uses_limit,
            useTimeOut: itemModel.items_item.useTimeOut,
            execTimeOut: itemModel.items_item.execTimeOut,
            customData: itemModel.items_item.customData
        };
        let itemObj = new itemClass(itemProps);
        if (itemObj.isType(ItemsConst.TYPES.EQUIPMENT)) {
            itemObj.equipped = (1 === itemModel.is_active);
        }
        await this.enrichWithModifiers(itemModel, itemObj, manager);
        return itemObj;
    }

    static async enrichWithModifiers(item, itemObj, manager)
    {
        if(0 === item.items_item.items_modifiers.length){
            return;
        }
        let modifiers = {};
        for(let modifierData of item.items_item.items_modifiers){
            if(modifierData.operation !== ModifierConst.OPS.SET){
                modifierData.value = Number(modifierData.value);
            }
            modifierData.target = manager.owner;
            modifiers[modifierData.id] = new Modifier(modifierData);
        }
        itemObj.modifiers = modifiers;
    }

}

module.exports = ItemsFactory;
