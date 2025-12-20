/**
 *
 * Reldens - Inventory Fixtures
 *
 */

module.exports.InventoryFixtures = {
    basicConfig: {
        id: 'test-inventory-1',
        label: 'Test Inventory',
        items: [],
        limit: 10,
        limitPerItem: 99
    },
    limitedConfig: {
        id: 'test-inventory-2',
        label: 'Limited Inventory',
        items: [],
        limit: 5,
        limitPerItem: 10
    },
    unlimitedConfig: {
        id: 'test-inventory-3',
        label: 'Unlimited Inventory',
        items: [],
        limit: 0,
        limitPerItem: 0
    },
    groupConfig: {
        id: 'test-group-1',
        label: 'Test Item Group',
        items: [],
        limit: 20,
        limitPerItem: 50,
        groupKey: 'equipment'
    }
};
