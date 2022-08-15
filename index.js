/**
 *
 * Reldens - Items System
 *
 */

module.exports = {
    ItemsServer: require('./lib/server'),
    ItemsManager: require('./lib/manager'),
    Inventory: require('./lib/item/inventory'),
    ItemGroup: require('./lib/item/group'),
    ItemBase: require('./lib/item/type/item-base'),
    ItemEquipment: require('./lib/item/type/equipment'),
    ItemUsable: require('./lib/item/type/usable'),
    ItemSingle: require('./lib/item/type/single'),
    ItemSingleEquipment: require('./lib/item/type/single-equipment'),
    ItemSingleUsable: require('./lib/item/type/single-usable'),
    ModelEntity: require('./lib/item/model-entity'),
    ItemsConst: require('./lib/constants'),
    ItemsEvents: require('./lib/items-events'),
    Receiver: require('./lib/client/receiver'),
    ItemsDataGenerator: require('./lib/items-data-generator'),
    GroupsDataGenerator: require('./lib/groups-data-generator'),
    ExchangePlatform: require('./lib/exchange-platform'),
    ExchangeRequirement: require('./lib/exchange-requirement')
};
