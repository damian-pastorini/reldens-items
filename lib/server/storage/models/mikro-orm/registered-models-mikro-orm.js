/**
 *
 * Reldens - Items System - Registered Entities
 *
 */

const ItemModel = require('./item-model');
const ItemGroupModel = require('./item-group-model');
const InventoryModel = require('./inventory-model');
const ItemModifiersModel = require('./item-modifiers-model');

module.exports.rawRegisteredEntities = {
    item: ItemModel,
    itemGroup: ItemGroupModel,
    inventory: InventoryModel,
    itemModifiers: ItemModifiersModel
};
