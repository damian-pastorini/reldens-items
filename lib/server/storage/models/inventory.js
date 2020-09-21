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

}

module.exports.InventoryModel = InventoryModel;
