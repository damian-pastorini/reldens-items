/**
 *
 * Reldens - ItemBase Unit Tests
 *
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const ItemBase = require('../../../../lib/item/type/item-base');
const ItemsManager = require('../../../../lib/manager');
const ItemsConst = require('../../../../lib/constants');
const { TestHelpers } = require('../../../utils/test-helpers');
const { BaseItemsFixtures } = require('../../../fixtures/items/base-items');
const { MockOwner } = require('../../../fixtures/mocks/mock-owner');

describe('ItemBase', () => {
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
        it('should initialize with basic properties', () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            assert.strictEqual(item.key, 'test-basic-item');
            assert.strictEqual(item.id, 1);
            assert.strictEqual(item.item_id, 1);
            assert.strictEqual(item.label, 'Basic Test Item');
            assert.strictEqual(item.description, 'A basic item for testing');
            assert.strictEqual(item.qty, 1);
            assert.strictEqual(item.type, ItemsConst.TYPES.ITEM_BASE);
        });

        it('should generate uid when not provided', () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            delete itemData.uid;
            let item = new ItemBase(itemData);
            assert.ok(item.uid);
            assert.ok(item.uid.startsWith('test-basic-item'));
        });

        it('should use provided uid', () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager, uid: 'custom-uid-123'};
            let item = new ItemBase(itemData);
            assert.strictEqual(item.uid, 'custom-uid-123');
        });

        it('should handle custom data as object', () => {
            let itemData = {
                ...BaseItemsFixtures.itemWithCustomData,
                manager: manager
            };
            let item = new ItemBase(itemData);
            assert.strictEqual(item.rarity, 'rare');
            assert.strictEqual(item.durability, 100);
            assert.deepStrictEqual(item.enchantments, ['fire', 'ice']);
        });

        it('should handle custom data as JSON string', () => {
            let customData = JSON.stringify({special: 'value', power: 100});
            let itemData = {
                ...BaseItemsFixtures.basicItem,
                manager: manager,
                customData: customData
            };
            let item = new ItemBase(itemData);
            assert.strictEqual(item.special, 'value');
            assert.strictEqual(item.power, 100);
        });

        it('should set hasError when key is missing', () => {
            let itemData = {manager: manager};
            let item = new ItemBase(itemData);
            assert.strictEqual(item.hasError, true);
        });

        it('should set hasError when manager is missing', () => {
            let itemData = {key: 'test-item'};
            let item = new ItemBase(itemData);
            assert.strictEqual(item.hasError, true);
        });

        it('should initialize with default values for optional properties', () => {
            let itemData = {key: 'test', manager: manager};
            let item = new ItemBase(itemData);
            assert.strictEqual(item.id, null);
            assert.strictEqual(item.item_id, null);
            assert.strictEqual(item.label, '');
            assert.strictEqual(item.description, '');
            assert.strictEqual(item.qty, 0);
            assert.strictEqual(item.is_active, false);
            assert.strictEqual(item.singleInstance, false);
        });
    });

    describe('getInventoryId', () => {
        it('should return uid for non-single instance items', () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager, uid: 'test-uid-123'};
            let item = new ItemBase(itemData);
            assert.strictEqual(item.getInventoryId(), 'test-uid-123');
        });

        it('should return key for single instance items', () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager, uid: 'test-uid-123'};
            let item = new ItemBase(itemData);
            item.singleInstance = true;
            assert.strictEqual(item.getInventoryId(), 'test-basic-item');
        });
    });

    describe('isSingleInstance', () => {
        it('should return false for ItemBase', () => {
            assert.strictEqual(ItemBase.isSingleInstance(), false);
        });
    });

    describe('isType', () => {
        it('should return true for matching type', () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            assert.strictEqual(item.isType(ItemsConst.TYPES.ITEM_BASE), true);
        });

        it('should return false for non-matching type', () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            assert.strictEqual(item.isType(ItemsConst.TYPES.EQUIPMENT), false);
        });
    });

    describe('applyModifiers', () => {
        it('should return false when item has error', async () => {
            let itemData = {manager: manager};
            let item = new ItemBase(itemData);
            let result = await item.applyModifiers();
            assert.strictEqual(result, false);
        });

        it('should handle items without modifiers', async () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            let result = await item.applyModifiers();
            assert.strictEqual(result, undefined);
        });

        it('should call apply on each modifier', async () => {
            let applyCalled = 0;
            let mockModifiers = {
                mod1: {apply: (target) => { applyCalled++; }},
                mod2: {apply: (target) => { applyCalled++; }}
            };
            let itemData = {
                ...BaseItemsFixtures.basicItem,
                manager: manager,
                modifiers: mockModifiers
            };
            let item = new ItemBase(itemData);
            item.target = mockOwner;
            await item.applyModifiers();
            assert.strictEqual(applyCalled, 2);
        });
    });

    describe('revertModifiers', () => {
        it('should return false when item has error', async () => {
            let itemData = {manager: manager};
            let item = new ItemBase(itemData);
            let result = await item.revertModifiers();
            assert.strictEqual(result, false);
        });

        it('should handle items without modifiers', async () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            let result = await item.revertModifiers();
            assert.strictEqual(result, undefined);
        });

        it('should call revert on each modifier', async () => {
            let revertCalled = 0;
            let mockModifiers = {
                mod1: {
                    apply: (target) => {},
                    revert: (target) => { revertCalled++; }
                },
                mod2: {
                    apply: (target) => {},
                    revert: (target) => { revertCalled++; }
                }
            };
            let itemData = {
                ...BaseItemsFixtures.basicItem,
                manager: manager,
                modifiers: mockModifiers
            };
            let item = new ItemBase(itemData);
            item.target = mockOwner;
            await item.revertModifiers();
            assert.strictEqual(revertCalled, 2);
        });
    });

    describe('Properties', () => {
        it('should handle qty_limit property', () => {
            let itemData = {...BaseItemsFixtures.limitedQtyItem, manager: manager};
            let item = new ItemBase(itemData);
            assert.strictEqual(item.qty_limit, 10);
        });

        it('should handle uses_limit property', () => {
            let itemData = {...BaseItemsFixtures.useLimitedItem, manager: manager};
            let item = new ItemBase(itemData);
            assert.strictEqual(item.uses_limit, 3);
        });

        it('should handle autoRemoveItemOnZeroQty property', () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager, autoRemoveItemOnZeroQty: false};
            let item = new ItemBase(itemData);
            assert.strictEqual(item.autoRemoveItemOnZeroQty, false);
        });

        it('should default autoRemoveItemOnZeroQty to true', () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            assert.strictEqual(item.autoRemoveItemOnZeroQty, true);
        });
    });
});
