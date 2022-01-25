/**
 *
 * Reldens - Items System - Registered Entities
 *
 */

const { ItemModel } = require('./item-model');
const { GroupModel } = require('./group-model');
const { InventoryModel } = require('./inventory-model');
const { ModifiersModel } = require('./modifiers-model');

module.exports.rawRegisteredEntities = {
    item: ItemModel,
    group: GroupModel,
    inventory: InventoryModel,
    modifiers: ModifiersModel,
};
