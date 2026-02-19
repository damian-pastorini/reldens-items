/**
 *
 * Reldens - Base Items Fixtures
 *
 */

module.exports.BaseItemsFixtures = {
    basicItem: {
        id: 1,
        item_id: 1,
        key: 'test-basic-item',
        type: 10,
        label: 'Basic Test Item',
        description: 'A basic item for testing',
        qty: 1,
        qty_limit: 99,
        uses_limit: 0,
        useTimeOut: 0,
        execTimeOut: 0
    },
    itemWithModifiers: {
        id: 2,
        item_id: 2,
        key: 'test-modifier-item',
        type: 10,
        label: 'Item With Modifiers',
        description: 'An item with stat modifiers',
        qty: 1,
        qty_limit: 99,
        modifiers: [
            {key: 'atk', operation: 'add', value: 10},
            {key: 'def', operation: 'add', value: 5}
        ]
    },
    itemWithCustomData: {
        id: 3,
        item_id: 3,
        key: 'test-custom-data-item',
        type: 10,
        label: 'Item With Custom Data',
        qty: 1,
        customData: {
            rarity: 'rare',
            durability: 100,
            enchantments: ['fire', 'ice']
        }
    },
    limitedQtyItem: {
        id: 4,
        item_id: 4,
        key: 'test-limited-qty',
        type: 10,
        label: 'Limited Quantity Item',
        qty: 1,
        qty_limit: 10
    },
    useLimitedItem: {
        id: 5,
        item_id: 5,
        key: 'test-use-limited',
        type: 10,
        label: 'Use Limited Item',
        qty: 1,
        uses_limit: 3
    }
};
