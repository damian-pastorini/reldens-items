/**
 *
 * Reldens - Data Generators Unit Tests
 *
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const ItemsDataGenerator = require('../../lib/items-data-generator');
const GroupsDataGenerator = require('../../lib/groups-data-generator');
const ItemBase = require('../../lib/item/type/item-base');
const ItemGroup = require('../../lib/item/group');
const ItemsConst = require('../../lib/constants');
const { TestHelpers } = require('../utils/test-helpers');

describe('Data Generators', () => {

    beforeEach(() => {
        TestHelpers.clearEventListeners();
    });

    afterEach(() => {
        TestHelpers.clearEventListeners();
    });

    describe('ItemsDataGenerator', () => {
        describe('itemsListMappedData', () => {
            it('should return empty object for empty list', () => {
                let result = ItemsDataGenerator.itemsListMappedData({}, []);
                assert.deepStrictEqual(result, {});
            });

            it('should map items without custom classes', () => {
                let itemsModels = [
                    {
                        id: 1,
                        key: 'test-item',
                        type: ItemsConst.TYPES.ITEM_BASE,
                        label: 'Test Item'
                    }
                ];
                let result = ItemsDataGenerator.itemsListMappedData({}, itemsModels);
                assert.ok(result['test-item']);
                assert.ok(result['test-item'].class);
                assert.strictEqual(result['test-item'].data.key, 'test-item');
            });

            it('should use custom inventory classes', () => {
                class CustomItem extends ItemBase {}
                let inventoryClasses = {'custom-item': CustomItem};
                let itemsModels = [
                    {
                        id: 1,
                        key: 'custom-item',
                        type: ItemsConst.TYPES.ITEM_BASE,
                        label: 'Custom Item'
                    }
                ];
                let result = ItemsDataGenerator.itemsListMappedData(inventoryClasses, itemsModels);
                assert.strictEqual(result['custom-item'].class, CustomItem);
            });

            it('should fall back to type-based class when custom class not found', () => {
                let itemsModels = [
                    {
                        id: 1,
                        key: 'standard-item',
                        type: ItemsConst.TYPES.ITEM_BASE,
                        label: 'Standard Item'
                    }
                ];
                let result = ItemsDataGenerator.itemsListMappedData({}, itemsModels);
                assert.strictEqual(result['standard-item'].class, ItemBase);
            });

            it('should process items with modifiers', () => {
                let itemsModels = [
                    {
                        id: 1,
                        key: 'sword',
                        type: ItemsConst.TYPES.EQUIPMENT,
                        label: 'Sword',
                        related_items_item_modifiers: [
                            {id: 1, key: 'atk', operation: 'add', value: 10}
                        ]
                    }
                ];
                let result = ItemsDataGenerator.itemsListMappedData({}, itemsModels);
                assert.ok(result['sword'].data.modifiers);
                assert.ok(result['sword'].data.modifiers[1]);
            });

            it('should handle multiple items', () => {
                let itemsModels = [
                    {id: 1, key: 'item-1', type: ItemsConst.TYPES.ITEM_BASE, label: 'Item 1'},
                    {id: 2, key: 'item-2', type: ItemsConst.TYPES.ITEM_BASE, label: 'Item 2'},
                    {id: 3, key: 'item-3', type: ItemsConst.TYPES.ITEM_BASE, label: 'Item 3'}
                ];
                let result = ItemsDataGenerator.itemsListMappedData({}, itemsModels);
                assert.strictEqual(Object.keys(result).length, 3);
            });
        });

        describe('generateItemModifiers', () => {
            it('should convert modifier data to instances', () => {
                let itemModel = {
                    related_items_item_modifiers: [
                        {id: 1, key: 'atk', operation: 'add', value: 15}
                    ]
                };
                let modifiers = ItemsDataGenerator.generateItemModifiers(itemModel);
                assert.ok(modifiers[1]);
                assert.ok(modifiers[1].apply);
                assert.ok(modifiers[1].revert);
            });

            it('should convert numeric values for non-set operations', () => {
                let itemModel = {
                    related_items_item_modifiers: [
                        {id: 1, key: 'atk', operation: 'add', value: '20'}
                    ]
                };
                let modifiers = ItemsDataGenerator.generateItemModifiers(itemModel);
                assert.strictEqual(typeof modifiers[1].value, 'number');
            });

            it('should handle multiple modifiers', () => {
                let itemModel = {
                    related_items_item_modifiers: [
                        {id: 1, key: 'atk', operation: 'add', value: 10},
                        {id: 2, key: 'def', operation: 'add', value: 5},
                        {id: 3, key: 'hp', operation: 'multiply', value: 1.1}
                    ]
                };
                let modifiers = ItemsDataGenerator.generateItemModifiers(itemModel);
                assert.strictEqual(Object.keys(modifiers).length, 3);
            });
        });
    });

    describe('GroupsDataGenerator', () => {
        describe('groupsListMappedData', () => {
            it('should return empty object for empty list', () => {
                let result = GroupsDataGenerator.groupsListMappedData({}, []);
                assert.deepStrictEqual(result, {});
            });

            it('should map groups without custom classes', () => {
                let groupModels = [
                    {
                        id: 1,
                        key: 'equipment',
                        label: 'Equipment',
                        description: 'Equipment items',
                        sort: 1,
                        files_name: 'equipment.png'
                    }
                ];
                let result = GroupsDataGenerator.groupsListMappedData({}, groupModels);
                assert.ok(result.groupList);
                assert.ok(result.groupList['equipment']);
                assert.strictEqual(result.groupList['equipment'].data.key, 'equipment');
            });

            it('should use custom group classes', () => {
                class CustomGroup extends ItemGroup {}
                let inventoryClasses = {'custom-group': CustomGroup};
                let groupModels = [
                    {
                        id: 1,
                        key: 'custom-group',
                        label: 'Custom Group'
                    }
                ];
                let result = GroupsDataGenerator.groupsListMappedData(inventoryClasses, groupModels);
                assert.strictEqual(result.groupList['custom-group'].class, CustomGroup);
            });

            it('should create groupBaseData', () => {
                let groupModels = [
                    {
                        id: 1,
                        key: 'consumables',
                        label: 'Consumables',
                        description: 'Consumable items',
                        sort: 2,
                        files_name: 'consumables.png'
                    }
                ];
                let result = GroupsDataGenerator.groupsListMappedData({}, groupModels);
                assert.ok(result.groupBaseData['consumables']);
                assert.strictEqual(result.groupBaseData['consumables'].id, 1);
                assert.strictEqual(result.groupBaseData['consumables'].label, 'Consumables');
            });

            it('should handle multiple groups', () => {
                let groupModels = [
                    {id: 1, key: 'group-1', label: 'Group 1'},
                    {id: 2, key: 'group-2', label: 'Group 2'},
                    {id: 3, key: 'group-3', label: 'Group 3'}
                ];
                let result = GroupsDataGenerator.groupsListMappedData({}, groupModels);
                assert.strictEqual(Object.keys(result.groupList).length, 3);
                assert.strictEqual(Object.keys(result.groupBaseData).length, 3);
            });

            it('should include groupModels in result', () => {
                let groupModels = [
                    {id: 1, key: 'test-group', label: 'Test Group'}
                ];
                let result = GroupsDataGenerator.groupsListMappedData({}, groupModels);
                assert.ok(result.groupModels);
                assert.strictEqual(result.groupModels.length, 1);
            });
        });

        describe('addGroup', () => {
            it('should add group to collections', () => {
                let groups = {groupList: {}, groupBaseData: {}};
                let groupModel = {
                    id: 1,
                    key: 'new-group',
                    label: 'New Group',
                    description: 'A new group',
                    sort: 1,
                    files_name: 'new.png'
                };
                GroupsDataGenerator.addGroup(groupModel, groups, {});
                assert.ok(groups.groupList['new-group']);
                assert.ok(groups.groupBaseData['new-group']);
            });

            it('should use custom class when provided', () => {
                class CustomGroup extends ItemGroup {}
                let inventoryClasses = {'custom': CustomGroup};
                let groups = {groupList: {}, groupBaseData: {}};
                let groupModel = {id: 1, key: 'custom', label: 'Custom'};
                GroupsDataGenerator.addGroup(groupModel, groups, inventoryClasses);
                assert.strictEqual(groups.groupList['custom'].class, CustomGroup);
            });
        });
    });
});
