/**
 *
 * Reldens - ItemGroup Unit Tests
 *
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const ItemGroup = require('../../../lib/item/group');
const ItemBase = require('../../../lib/item/type/item-base');
const ItemsManager = require('../../../lib/manager');
const { TestHelpers } = require('../../utils/test-helpers');
const { BaseItemsFixtures } = require('../../fixtures/items/base-items');
const { MockOwner } = require('../../fixtures/mocks/mock-owner');

describe('ItemGroup', () => {
    let mockOwner;
    let manager;

    beforeEach(() => {
        mockOwner = new MockOwner();
        manager = new ItemsManager({owner: mockOwner});
        TestHelpers.clearEventListeners();
    });

    afterEach(() => {
        TestHelpers.clearEventListeners();
    });

    describe('Constructor', () => {
        it('should initialize with required properties', () => {
            let groupConfig = {
                id: 'group-1',
                key: 'equipment',
                label: 'Equipment Bag',
                itemsLimit: 20,
                limitPerItem: 50
            };
            let group = new ItemGroup(groupConfig);
            assert.strictEqual(group.id, 'group-1');
            assert.strictEqual(group.key, 'equipment');
            assert.strictEqual(group.label, 'Equipment Bag');
        });

        it('should extend Inventory functionality', async () => {
            let groupConfig = {
                id: 'group-1',
                key: 'equipment'
            };
            let group = new ItemGroup(groupConfig);
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            let result = await group.addItem(item);
            assert.notStrictEqual(result, false);
            assert.strictEqual(Object.keys(group.items).length, 1);
        });

        it('should use custom events prefix', () => {
            let groupConfig = {
                id: 'group-1',
                key: 'equipment',
                eventsPrefix: 'custom'
            };
            let group = new ItemGroup(groupConfig);
            assert.ok(group.eventsPrefix.includes('custom'));
        });
    });

    describe('Group Properties', () => {
        it('should handle all optional properties', () => {
            let groupConfig = {
                id: 'group-1',
                key: 'equipment',
                label: 'Equipment',
                description: 'Equipment items',
                files_name: 'equipment.png',
                sort: 1,
                items_limit: 10,
                limit_per_item: 99
            };
            let group = new ItemGroup(groupConfig);
            assert.strictEqual(group.label, 'Equipment');
            assert.strictEqual(group.description, 'Equipment items');
            assert.strictEqual(group.files_name, 'equipment.png');
            assert.strictEqual(group.sort, 1);
            assert.strictEqual(group.items_limit, 10);
            assert.strictEqual(group.limit_per_item, 99);
        });
    });
});
