
const { Model } = require('objection');
const { ItemModel } = require('./item');

class InventoryModel extends Model
{

    static get tableName()
    {
        return 'items_inventory';
    }

    static get relationMappings()
    {
        return {
            items_item_id: {
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
