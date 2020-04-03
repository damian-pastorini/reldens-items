
const { Model } = require('objection');

class ItemModel extends Model
{

    static get tableName()
    {
        return 'items_item';
    }

    static get relationMappings()
    {
        return {
            items_group_id: {
                relation: Model.HasOneRelation,
                modelClass: ItemModel,
                join: {
                    from: 'items_item.group_id',
                    to: 'items_group.id'
                }
            },
            items_modifiers: {
                relation: Model.HasManyRelation,
                modelClass: ItemModel,
                join: {
                    from: 'items_item.id',
                    to: 'items_item_modifiers.item_id'
                }
            }
        };
    }

}

module.exports.ItemModel = ItemModel;
