/**
 *
 * Reldens - Items System - Group
 *
 */

const { ModelClass } = require('@reldens/storage');

class GroupModel extends ModelClass
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
                relation: ModelClass.BelongsToOneRelation,
                modelClass: ItemModel,
                join: {
                    from: this.tableName+'.item_id',
                    to: 'items_item.id'
                }
            }
        };
    }

}

module.exports.GroupModel = GroupModel;
