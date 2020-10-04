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

    loadItemsByOwnerId(ownerId)
    {
        return this.query()
            .where('owner_id', ownerId)
            .withGraphFetched('[items_item.items_modifiers]');
    }

    saveItem(itemData)
    {
        return this.query().insert(itemData);
    }

    removeItemById(itemId)
    {
        return this.query().where('id', itemId).delete();
    }

    updateItemById(itemId, patchData)
    {
        return this.query().patch(patchData).findById(itemId);
    }

}

module.exports.InventoryModel = InventoryModel;
