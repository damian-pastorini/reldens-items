/**
 *
 * Reldens - Single Items Fixtures
 *
 */

module.exports.SingleItemsFixtures = {
    stackableItem: {
        id: 30,
        item_id: 30,
        key: 'test-stackable-item',
        type: 3,
        label: 'Stackable Item',
        description: 'An item that stacks',
        qty: 50,
        qty_limit: 99
    },
    arrows: {
        id: 31,
        item_id: 31,
        key: 'test-arrows',
        type: 3,
        label: 'Arrows',
        description: 'Stackable arrows',
        qty: 100,
        qty_limit: 999
    },
    craftingMaterial: {
        id: 32,
        item_id: 32,
        key: 'test-crafting-material',
        type: 3,
        label: 'Crafting Material',
        description: 'Material for crafting',
        qty: 25,
        qty_limit: 200
    }
};
