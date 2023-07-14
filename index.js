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
    ItemsFactory: require('./lib/items-factory'),
    ModelEntity: require('./lib/item/model-entity'),
    ItemsConst: require('./lib/constants'),
    ItemsEvents: require('./lib/items-events'),
    Receiver: require('./lib/client/receiver'),
    ItemsDataGenerator: require('./lib/items-data-generator'),
    GroupsDataGenerator: require('./lib/groups-data-generator'),
    ExchangePlatform: require('./lib/exchange/exchange-platform'),
    ExchangeRequirement: require('./lib/exchange/exchange-requirement'),
    RequirementsCollection: require('./lib/exchange/requirements-collection'),
    RequirementsProcessor: require('./lib/exchange/requirements-processor'),
    ExchangeReward: require('./lib/exchange/exchange-reward'),
    RewardsCollection: require('./lib/exchange/rewards-collection'),
    RewardsProcessor: require('./lib/exchange/rewards-processor'),
    ItemsError: require('./lib/items-error')
};
