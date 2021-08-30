/**
 *
 * Reldens - Items System - Item
 *
 */

const { ModelClass } = require('@reldens/storage');

class ItemModel extends ModelClass
{

    static get tableName()
    {
        return 'items_item';
    }

    static get relationMappings()
    {
        const { InventoryModel } = require('./inventory');
        const { GroupModel } = require('./group');
        const { ModifiersModel } = require('./modifiers');
        return {
            items_inventory: {
                relation: ModelClass.BelongsToOneRelation,
                modelClass: InventoryModel,
                join: {
                    from: this.tableName+'.id',
                    to: InventoryModel.tableName+'.item_id'
                }
            },
            items_group_id: {
                relation: ModelClass.HasOneRelation,
                modelClass: GroupModel,
                join: {
                    from: this.tableName+'.group_id',
                    to: GroupModel.tableName+'.id'
                }
            },
            items_modifiers: {
                relation: ModelClass.HasManyRelation,
                modelClass: ModifiersModel,
                join: {
                    from: this.tableName+'.id',
                    to: ModifiersModel.tableName+'.item_id'
                }
            }
        };
    }

    static loadItemFullData()
    {
        return this.query()
            .withGraphFetched('[items_inventory, items_group_id, items_modifiers]');
    }

}

module.exports.ItemModel = ItemModel;
