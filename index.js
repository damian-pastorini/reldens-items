/**
 *
 * Reldens - Items Manager
 *
 */

module.exports = {
    ItemsServer: require('./lib/server'),
    ItemsManager: require('./lib/manager'),
    Inventory: require('./lib/item/inventory'),
    ItemGroup: require('./lib/item/group'),
    ItemBase: require('./lib/item/type/item'),
    ItemEquipment: require('./lib/item/type/equipment'),
    ItemUsable: require('./lib/item/type/usable'),
};
