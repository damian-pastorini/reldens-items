/**
 *
 * Reldens - Items System - InventoryModel
 *
 */

const { ModelClassDeprecated } = require('@reldens/storage');

class InventoryModel extends ModelClassDeprecated
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
                relation: ModelClassDeprecated.HasOneRelation,
                modelClass: ItemModel,
                join: {
                    from: this.tableName+'.item_id',
                    to: ItemModel.tableName+'.id'
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
