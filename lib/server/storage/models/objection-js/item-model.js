/**
 *
 * Reldens - Items System - Item
 *
 */

const { ObjectionJsRawModel } = require('@reldens/storage');

class ItemModel extends ObjectionJsRawModel
{

    static get tableName()
    {
        return 'items_item';
    }

    static get relationMappings()
    {
        const { InventoryModel } = require('./inventory-model');
        const { GroupModel } = require('./group-model');
        const { ModifiersModel } = require('./modifiers-model');
        return {
            items_inventory: {
                relation: this.BelongsToOneRelation,
                modelClass: InventoryModel,
                join: {
                    from: this.tableName+'.id',
                    to: InventoryModel.tableName+'.item_id'
                }
            },
            items_group_id: {
                relation: this.HasOneRelation,
                modelClass: GroupModel,
                join: {
                    from: this.tableName+'.group_id',
                    to: GroupModel.tableName+'.id'
                }
            },
            items_modifiers: {
                relation: this.HasManyRelation,
                modelClass: ModifiersModel,
                join: {
                    from: this.tableName+'.id',
                    to: ModifiersModel.tableName+'.item_id'
                }
            }
        };
    }

}

module.exports.ItemModel = ItemModel;
