/**
 *
 * Reldens - Items System - Modifiers
 *
 */

const { ModelClass } = require('@reldens/storage');

class ModifiersModel extends ModelClass
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
                relation: ModelClass.BelongsToOneRelation,
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
