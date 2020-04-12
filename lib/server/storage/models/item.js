/**
 *
 * Reldens - Items System - Item
 *
 */

const { Model } = require('objection');
const { InventoryModel } = require('./inventory');
const { InventoryGroup } = require('./group');
const { InventoryModifiers } = require('./modifiers');

class ItemModel extends Model
{

    static get tableName()
    {
        return 'items_item';
    }

    static get relationMappings()
    {
        return {
            items_inventory: {
                relation: Model.BelongsToOneRelation,
                modelClass: InventoryModel,
                join: {
                    from: 'items_item.id',
                    to: 'items_inventory.item_id'
                }
            },
            items_group_id: {
                relation: Model.HasOneRelation,
                modelClass: InventoryGroup,
                join: {
                    from: 'items_item.group_id',
                    to: 'items_group.id'
                }
            },
            items_modifiers: {
                relation: Model.HasManyRelation,
                modelClass: InventoryModifiers,
                join: {
                    from: 'items_item.id',
                    to: 'items_item_modifiers.item_id'
                }
            }
        };
    }

}

module.exports.ItemModel = ItemModel;
