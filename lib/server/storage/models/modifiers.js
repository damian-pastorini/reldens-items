/**
 *
 * Reldens - Items System - Modifiers
 *
 */

const { Model } = require('objection');

class ModifiersModel extends Model
{

    static get tableName()
    {
        return 'items_item_modifiers';
    }

    static get relationMappings()
    {
        const { ItemModel } = require('./item');
        return {
            items_group_id: {
                relation: Model.BelongsToOneRelation,
                modelClass: ItemModel,
                join: {
                    from: 'items_item_modifiers.item_id',
                    to: 'items_item.id'
                }
            }
        };
    }

}

module.exports.ModifiersModel = ModifiersModel;
