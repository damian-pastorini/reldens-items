/**
 *
 * Reldens - Items System - InventoryModel
 *
 */

const { Model } = require('objection');

class InventoryModel extends Model
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
                relation: Model.HasOneRelation,
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
