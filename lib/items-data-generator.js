/**
 *
 * Reldens - ItemsDataGenerator
 *
 * This class will use a list of classes and an items models list to generate the proper instances for each case.
 * This is outside and unrelated to the server storage space, because even if you don't use a storage you could still
 * create your models manually, populate them with the proper data and get your classes instances with this generator.
 *
 */

const ItemTypes = require('./item/item-types');
const { ModifierConst, Modifier } = require('@reldens/modifiers');
const { sc } = require('@reldens/utils');

class ItemsDataGenerator
{

    static itemsListMappedData(inventoryClasses = {}, itemsModelsList)
    {
        if(0 === itemsModelsList.length){
            return {};
        }
        let itemsTypesList = {};
        let itemTypes = new ItemTypes();
        for(let itemModel of itemsModelsList){
            if(itemModel.items_modifiers){
                itemModel.modifiers = this.generateItemModifiers(itemModel);
            }
            itemsTypesList[itemModel.key] = {
                class: sc.get(inventoryClasses, itemModel.key, itemTypes.classByTypeId(itemModel.type)),
                data: itemModel
            };
        }
        return itemsTypesList;
    }

    static generateItemModifiers(itemModel)
    {
        let modifiers = {};
        for(let modifierData of itemModel.items_modifiers){
            if(modifierData.operation !== ModifierConst.OPS.SET){
                modifierData.value = Number(modifierData.value);
            }
            modifiers[modifierData.id] = new Modifier(modifierData);
        }
        return modifiers;
    }
}

module.exports = ItemsDataGenerator;