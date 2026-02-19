/**
 *
 * Reldens - SingleUsable Unit Tests
 *
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const SingleUsable = require('../../../../lib/item/type/single-usable');
const ItemsManager = require('../../../../lib/manager');
const ItemsConst = require('../../../../lib/constants');
const { TestHelpers } = require('../../../utils/test-helpers');
const { UsableItemsFixtures } = require('../../../fixtures/items/usable-items');
const { MockOwner } = require('../../../fixtures/mocks/mock-owner');

describe('SingleUsable', () => {
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
            let itemData = {...UsableItemsFixtures.singleUsable, manager: manager};
            let item = new SingleUsable(itemData);
            assert.strictEqual(item.singleInstance, true);
        });

        it('should maintain usable type', () => {
            let itemData = {...UsableItemsFixtures.singleUsable, manager: manager};
            let item = new SingleUsable(itemData);
            assert.strictEqual(item.type, ItemsConst.TYPES.USABLE);
        });
    });

    describe('Use functionality', () => {
        it('should be able to use the item', async () => {
            let itemData = {...UsableItemsFixtures.singleUsable, manager: manager};
            let item = new SingleUsable(itemData);
            assert.strictEqual(item.canUse, true);
            assert.strictEqual(item.currentUses, 1);
        });
    });
});
