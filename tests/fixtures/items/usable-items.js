/**
 *
 * Reldens - Usable Items Fixtures
 *
 */

module.exports.UsableItemsFixtures = {
    simpleUsable: {
        id: 19,
        item_id: 19,
        key: 'test-simple-usable',
        type: 2,
        label: 'Simple Usable',
        description: 'Usable without modifiers for testing',
        qty: 1
    },
    healthPotion: {
        id: 20,
        item_id: 20,
        key: 'test-health-potion',
        type: 2,
        label: 'Health Potion',
        description: 'Restores health',
        qty: 1,
        modifiers: [
            {key: 'hp', operation: 'add', value: 50}
        ]
    },
    manaPotion: {
        id: 21,
        item_id: 21,
        key: 'test-mana-potion',
        type: 2,
        label: 'Mana Potion',
        description: 'Restores mana',
        qty: 1,
        modifiers: [
            {key: 'mp', operation: 'add', value: 30}
        ]
    },
    limitedUseItem: {
        id: 22,
        item_id: 22,
        key: 'test-limited-use',
        type: 2,
        label: 'Limited Use Item',
        description: 'Can only be used 3 times',
        qty: 1,
        uses_limit: 3,
        modifiers: [
            {key: 'hp', operation: 'add', value: 100}
        ]
    },
    singleUsable: {
        id: 23,
        item_id: 23,
        key: 'test-single-usable',
        type: 5,
        label: 'Stackable Potion',
        description: 'Stackable usable item',
        qty: 10
    }
};
