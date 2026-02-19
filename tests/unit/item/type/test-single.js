/**
 *
 * Reldens - ItemSingle Unit Tests
 *
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const ItemSingle = require('../../../../lib/item/type/single');
const ItemsManager = require('../../../../lib/manager');
const { TestHelpers } = require('../../../utils/test-helpers');
const { SingleItemsFixtures } = require('../../../fixtures/items/single-items');
const { MockOwner } = require('../../../fixtures/mocks/mock-owner');

describe('ItemSingle', () => {
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
        it('should set singleInstance to true', () => {
            let itemData = {...SingleItemsFixtures.stackableItem, manager: manager};
            let item = new ItemSingle(itemData);
            assert.strictEqual(item.singleInstance, true);
        });

        it('should set uid to key', () => {
            let itemData = {...SingleItemsFixtures.stackableItem, manager: manager};
            let item = new ItemSingle(itemData);
            assert.strictEqual(item.uid, item.key);
        });
    });

    describe('isSingleInstance', () => {
        it('should return true', () => {
            assert.strictEqual(ItemSingle.isSingleInstance(), true);
        });
    });

    describe('getInventoryId', () => {
        it('should return key for single instance items', () => {
            let itemData = {...SingleItemsFixtures.stackableItem, manager: manager};
            let item = new ItemSingle(itemData);
            assert.strictEqual(item.getInventoryId(), item.key);
        });
    });
});
