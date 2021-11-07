/**
 *
 * Reldens - Items System - Group
 *
 */

const { ModelClassDeprecated } = require('@reldens/storage');

class GroupModel extends ModelClassDeprecated
{

    static get tableName()
    {
        return 'items_group';
    }

    static get relationMappings()
    {
        const { ItemModel } = require('./item');
        return {
            parent_item: {
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

module.exports.GroupModel = GroupModel;
