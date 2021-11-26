/**
 *
 * Reldens - Items System - Modifiers
 *
 */

const { ObjectionJsRawModel } = require('@reldens/storage');

class ModifiersModel extends ObjectionJsRawModel
{

    static get tableName()
    {
        return 'items_item_modifiers';
    }

    static get relationMappings()
    {
        const { ItemModel } = require('./item-model');
        return {
            items_group_id: {
                relation: this.BelongsToOneRelation,
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