/**
 *
 * Reldens - Inventory Unit Tests
 *
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const Inventory = require('../../../lib/item/inventory');
const ItemBase = require('../../../lib/item/type/item-base');
const ItemSingle = require('../../../lib/item/type/single');
const ItemsManager = require('../../../lib/manager');
const ItemsConst = require('../../../lib/constants');
const ItemsEvents = require('../../../lib/items-events');
const { TestHelpers } = require('../../utils/test-helpers');
const { BaseItemsFixtures } = require('../../fixtures/items/base-items');
const { SingleItemsFixtures } = require('../../fixtures/items/single-items');
const { InventoryFixtures } = require('../../fixtures/inventories/test-inventories');
const { MockOwner } = require('../../fixtures/mocks/mock-owner');

describe('Inventory', () => {
    let inventory;
    let mockOwner;
    let manager;

    beforeEach(() => {
        mockOwner = new MockOwner();
        manager = new ItemsManager({owner: mockOwner});
        inventory = new Inventory(InventoryFixtures.basicConfig);
        TestHelpers.clearEventListeners();
    });

    afterEach(() => {
        TestHelpers.clearEventListeners();
    });

    describe('Constructor', () => {
        it('should initialize with default properties', () => {
            let inv = new Inventory({});
            assert.strictEqual(typeof inv.items, 'object');
            assert.strictEqual(inv.limitPerItem, -1);
            assert.strictEqual(inv.itemsLimit, -1);
            assert.strictEqual(inv.locked, false);
            assert.strictEqual(inv.eventsPrefix, '');
        });

        it('should initialize with custom properties', () => {
            let config = {
                limitPerItem: 50,
                itemsLimit: 20,
                eventsPrefix: 'test.inventory'
            };
            let inv = new Inventory(config);
            assert.strictEqual(inv.limitPerItem, 50);
            assert.strictEqual(inv.itemsLimit, 20);
            assert.strictEqual(inv.eventsPrefix, 'test.inventory');
        });
    });

    describe('validate', async () => {
        it('should validate a valid item', async () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            let result = await inventory.validate(item);
            assert.strictEqual(result, true);
        });

        it('should fail validation for undefined item', async () => {
            try {
                await inventory.validate(null);
            } catch(error){
                assert.ok(error);
            }
        });

        it('should fail validation for item without getInventoryId', async () => {
            let invalidItem = {key: 'test'};
            let result = await inventory.validate(invalidItem);
            assert.strictEqual(result, false);
        });

        it('should fail validation for item without key', async () => {
            let invalidItem = {getInventoryId: () => 'test-id'};
            let result = await inventory.validate(invalidItem);
            assert.strictEqual(result, false);
            assert.strictEqual(inventory.lastError.code, ItemsConst.ERROR_CODES.UNDEFINED_ITEM_KEY);
        });
    });

    describe('findItemByKey', () => {
        it('should find item by key', async () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            await inventory.addItem(item);
            let found = inventory.findItemByKey('test-basic-item');
            assert.strictEqual(found.key, 'test-basic-item');
        });

        it('should return false when item not found', () => {
            let found = inventory.findItemByKey('non-existent');
            assert.strictEqual(found, false);
        });
    });

    describe('addItem', () => {
        it('should add item successfully', async () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            let result = await inventory.addItem(item);
            assert.notStrictEqual(result, false);
            assert.strictEqual(Object.keys(inventory.items).length, 1);
        });

        it('should fail when inventory is locked', async () => {
            inventory.locked = true;
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            let result = await inventory.addItem(item);
            assert.strictEqual(result, false);
            assert.strictEqual(inventory.lastError.code, ItemsConst.ERROR_CODES.LOCKED_FOR_ADD_ITEM);
        });

        it('should fail when items limit reached', async () => {
            inventory.itemsLimit = 1;
            let item1Data = {...BaseItemsFixtures.basicItem, manager: manager};
            let item2Data = {...BaseItemsFixtures.basicItem, id: 99, item_id: 99, key: 'test-item-2', manager: manager};
            let item1 = new ItemBase(item1Data);
            let item2 = new ItemBase(item2Data);
            await inventory.addItem(item1);
            let result = await inventory.addItem(item2);
            assert.strictEqual(result, false);
            assert.strictEqual(
                inventory.lastError.code,
                ItemsConst.ERROR_CODES.MAX_TOTAL_REACHED_FOR_ADD_ITEM
            );
        });

        it('should fail when item already exists and not single instance', async () => {
            let item1Data = {...BaseItemsFixtures.basicItem, manager: manager, uid: 'unique-1'};
            let item2Data = {...BaseItemsFixtures.basicItem, manager: manager, uid: 'unique-1'};
            let item1 = new ItemBase(item1Data);
            let item2 = new ItemBase(item2Data);
            await inventory.addItem(item1);
            let result = await inventory.addItem(item2);
            assert.strictEqual(result, false);
            assert.strictEqual(
                inventory.lastError.code,
                ItemsConst.ERROR_CODES.ITEM_EXISTS_FOR_ADD_ITEM
            );
        });

        it('should fail when item qty exceeds limit per item', async () => {
            inventory.limitPerItem = 10;
            let itemData = {...BaseItemsFixtures.basicItem, qty: 50, manager: manager};
            let item = new ItemBase(itemData);
            let result = await inventory.addItem(item);
            assert.strictEqual(result, false);
            assert.strictEqual(
                inventory.lastError.code,
                ItemsConst.ERROR_CODES.ITEM_LIMIT_EXCEEDED_FOR_ADD_ITEM
            );
        });

        it('should increase qty for single instance items', async () => {
            let item1Data = {...SingleItemsFixtures.stackableItem, manager: manager};
            let item2Data = {...SingleItemsFixtures.stackableItem, qty: 25, manager: manager};
            let item1 = new ItemSingle(item1Data);
            let item2 = new ItemSingle(item2Data);
            await inventory.addItem(item1);
            await inventory.addItem(item2);
            let foundItem = inventory.findItemByKey('test-stackable-item');
            assert.strictEqual(foundItem.qty, 75);
        });
    });

    describe('addItems', () => {
        it('should add multiple items', async () => {
            let item1Data = {...BaseItemsFixtures.basicItem, manager: manager};
            let item2Data = {...BaseItemsFixtures.itemWithModifiers, id: 100, item_id: 100, manager: manager};
            let item1 = new ItemBase(item1Data);
            let item2 = new ItemBase(item2Data);
            let result = await inventory.addItems([item1, item2]);
            assert.strictEqual(result, true);
            assert.strictEqual(Object.keys(inventory.items).length, 2);
        });

        it('should fail if any item fails to add', async () => {
            inventory.itemsLimit = 1;
            let item1Data = {...BaseItemsFixtures.basicItem, manager: manager};
            let item2Data = {...BaseItemsFixtures.itemWithModifiers, id: 100, item_id: 100, manager: manager};
            let item1 = new ItemBase(item1Data);
            let item2 = new ItemBase(item2Data);
            let result = await inventory.addItems([item1, item2]);
            assert.strictEqual(result, false);
            assert.strictEqual(inventory.lastError.code, ItemsConst.ERROR_CODES.ADD_ITEMS_ERROR);
        });
    });

    describe('removeItem', () => {
        it('should remove item successfully', async () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            await inventory.addItem(item);
            let result = await inventory.removeItem(item.getInventoryId());
            assert.strictEqual(result, true);
            assert.strictEqual(Object.keys(inventory.items).length, 0);
        });

        it('should fail when inventory is locked', async () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            await inventory.addItem(item);
            inventory.locked = true;
            let result = await inventory.removeItem(item.getInventoryId());
            assert.strictEqual(result, false);
            assert.strictEqual(inventory.lastError.code, ItemsConst.ERROR_CODES.LOCKED_FOR_REMOVE_ITEM);
        });

        it('should fail when item key not found', async () => {
            let result = await inventory.removeItem('non-existent-key');
            assert.strictEqual(result, false);
            assert.strictEqual(inventory.lastError.code, ItemsConst.ERROR_CODES.KEY_NOT_FOUND);
        });
    });

    describe('modifyItemQty', () => {
        it('should set quantity correctly', async () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            await inventory.addItem(item);
            let result = await inventory.setItemQty(item.getInventoryId(), 5);
            assert.strictEqual(result, true);
            assert.strictEqual(item.qty, 5);
        });

        it('should increase quantity correctly', async () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            await inventory.addItem(item);
            let result = await inventory.increaseItemQty(item.getInventoryId(), 10);
            assert.strictEqual(result, true);
            assert.strictEqual(item.qty, 11);
        });

        it('should decrease quantity correctly', async () => {
            let itemData = {...BaseItemsFixtures.basicItem, qty: 10, manager: manager};
            let item = new ItemBase(itemData);
            await inventory.addItem(item);
            let result = await inventory.decreaseItemQty(item.getInventoryId(), 3);
            assert.strictEqual(result, true);
            assert.strictEqual(item.qty, 7);
        });

        it('should not go below zero when decreasing', async () => {
            let itemData = {...BaseItemsFixtures.basicItem, qty: 5, manager: manager};
            let item = new ItemBase(itemData);
            await inventory.addItem(item);
            await inventory.decreaseItemQty(item.getInventoryId(), 10);
            assert.strictEqual(item.qty, 0);
        });

        it('should fail when inventory is locked', async () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            await inventory.addItem(item);
            inventory.locked = true;
            let result = await inventory.setItemQty(item.getInventoryId(), 5);
            assert.strictEqual(result, false);
            assert.strictEqual(
                inventory.lastError.code,
                ItemsConst.ERROR_CODES.LOCKED_FOR_MODIFY_ITEM_QTY
            );
        });

        it('should fail when item key not found', async () => {
            let result = await inventory.setItemQty('non-existent', 5);
            assert.strictEqual(result, false);
            assert.strictEqual(
                inventory.lastError.code,
                ItemsConst.ERROR_CODES.UNDEFINED_ITEM_KEY_FOR_OPERATION
            );
        });

        it('should fail when qty is not a number', async () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            await inventory.addItem(item);
            let result = await inventory.setItemQty(item.getInventoryId(), 'invalid');
            assert.strictEqual(result, false);
            assert.strictEqual(inventory.lastError.code, ItemsConst.ERROR_CODES.QTY_NOT_A_NUMBER);
        });

        it('should fail when exceeding limitPerItem on set', async () => {
            inventory.limitPerItem = 10;
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            await inventory.addItem(item);
            let result = await inventory.setItemQty(item.getInventoryId(), 15);
            assert.strictEqual(result, false);
            assert.strictEqual(
                inventory.lastError.code,
                ItemsConst.ERROR_CODES.ITEM_QTY_LIMIT_EXCEEDED
            );
        });
    });

    describe('setItems', () => {
        it('should set items successfully', async () => {
            let item1Data = {...BaseItemsFixtures.basicItem, manager: manager};
            let item2Data = {...BaseItemsFixtures.itemWithModifiers, id: 200, item_id: 200, manager: manager};
            let item1 = new ItemBase(item1Data);
            let item2 = new ItemBase(item2Data);
            let newItems = {};
            newItems[item1.getInventoryId()] = item1;
            newItems[item2.getInventoryId()] = item2;
            await inventory.setItems(newItems);
            assert.strictEqual(Object.keys(inventory.items).length, 2);
        });

        it('should fail when inventory is locked', async () => {
            inventory.locked = true;
            let result = await inventory.setItems({});
            assert.strictEqual(result, false);
            assert.strictEqual(inventory.lastError.code, ItemsConst.ERROR_CODES.LOCKED_FOR_SET_ITEMS);
        });
    });

    describe('Error Handling', () => {
        it('should set error with message and code', () => {
            inventory.setError('Test error', 'test.error.code');
            assert.strictEqual(inventory.lastError.message, 'Test error');
            assert.strictEqual(inventory.lastError.code, 'test.error.code');
        });

        it('should set error with data', () => {
            inventory.setError('Test error', 'test.code', {itemId: '123'});
            assert.strictEqual(inventory.lastError.data.itemId, '123');
        });
    });
});
