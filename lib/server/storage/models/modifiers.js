/**
 *
 * Reldens - Items System - Modifiers
 *
 */

const { ModelClassDeprecated } = require('@reldens/storage');

class ModifiersModel extends ModelClassDeprecated
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
                relation: ModelClassDeprecated.BelongsToOneRelation,
                modelClass: ItemModel,
                join: {
                    from: this.tableName+'.item_id',
                    to: ItemModel.tableName+'.id'
                }
            }
        };
    }

}

module.exports.ModifiersModel = ModifiersModel;
