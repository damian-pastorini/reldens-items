/**
 *
 * Reldens - Equipment Items Fixtures
 *
 */

module.exports.EquipmentItemsFixtures = {
    simpleEquipment: {
        id: 9,
        item_id: 9,
        key: 'test-simple-equipment',
        type: 1,
        label: 'Simple Equipment',
        description: 'Equipment without modifiers for testing',
        qty: 1
    },
    basicSword: {
        id: 10,
        item_id: 10,
        key: 'test-basic-sword',
        type: 1,
        label: 'Basic Sword',
        description: 'A basic sword for testing',
        qty: 1,
        modifiers: [
            {key: 'atk', operation: 'add', value: 15}
        ]
    },
    basicShield: {
        id: 11,
        item_id: 11,
        key: 'test-basic-shield',
        type: 1,
        label: 'Basic Shield',
        description: 'A basic shield for testing',
        qty: 1,
        modifiers: [
            {key: 'def', operation: 'add', value: 10}
        ]
    },
    enchantedArmor: {
        id: 12,
        item_id: 12,
        key: 'test-enchanted-armor',
        type: 1,
        label: 'Enchanted Armor',
        description: 'An armor with multiple modifiers',
        qty: 1,
        modifiers: [
            {key: 'def', operation: 'add', value: 20},
            {key: 'hp', operation: 'add', value: 50},
            {key: 'atk', operation: 'multiply', value: 1.1}
        ]
    },
    singleEquipment: {
        id: 13,
        item_id: 13,
        key: 'test-single-equipment',
        type: 4,
        label: 'Stackable Equipment',
        description: 'Equipment that can stack',
        qty: 5
    }
};
