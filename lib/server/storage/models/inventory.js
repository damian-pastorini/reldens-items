/**
 *
 * Reldens - Items System - InventoryModel
 *
 */

const { ModelClass } = require('@reldens/storage');

class InventoryModel extends ModelClass
{

    static get tableName()
    {
        return 'items_inventory';
    }

    static get relationMappings()
    {
        const { ItemModel } = require('./item');
        return {
            items_item: {
                relation: ModelClass.HasOneRelation,
                modelClass: ItemModel,
                join: {
                    from: 'items_inventory.item_id',
                    to: 'items_item.id'
                }
            }
        };
    }

    static loadItemsByOwnerId(ownerId)
    {
        return this.query()
            .where('owner_id', ownerId)
            .withGraphFetched('[items_item.items_modifiers]');
    }

    static saveItem(itemData)
    {
        return this.query().insert(itemData);
    }

    static removeItemById(itemId)
    {
        return this.query().where('id', itemId).delete();
    }

    static updateItemById(itemId, patchData)
    {
        return this.query().patch(patchData).findById(itemId);
    }

}

module.exports.InventoryModel = InventoryModel;
