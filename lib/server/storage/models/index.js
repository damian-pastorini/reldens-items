
const { ItemModel } = require('./item');
const { GroupModel } = require('./group');
const { InventoryModel } = require('./inventory');
const { ModifiersModel } = require('./modifiers');

module.exports = {
    item: ItemModel,
    group: GroupModel,
    inventory: InventoryModel,
    modifiers: ModifiersModel,
};
