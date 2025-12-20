/**
 *
 * Reldens - Usable Unit Tests
 *
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const Usable = require('../../../../lib/item/type/usable');
const ItemsManager = require('../../../../lib/manager');
const ItemsConst = require('../../../../lib/constants');
const { TestHelpers } = require('../../../utils/test-helpers');
const { UsableItemsFixtures } = require('../../../fixtures/items/usable-items');
const { MockOwner } = require('../../../fixtures/mocks/mock-owner');

describe('Usable', () => {
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
        it('should initialize as usable type', () => {
            let itemData = {...UsableItemsFixtures.healthPotion, manager: manager};
            let item = new Usable(itemData);
            assert.strictEqual(item.type, ItemsConst.TYPES.USABLE);
            assert.strictEqual(item.canUse, true);
            assert.strictEqual(item.uses, 1);
            assert.strictEqual(item.currentUses, 1);
        });

        it('should initialize with custom uses', () => {
            let itemData = {...UsableItemsFixtures.limitedUseItem, manager: manager, uses: 3};
            let item = new Usable(itemData);
            assert.strictEqual(item.uses, 3);
            assert.strictEqual(item.currentUses, 3);
        });
    });

    describe('use', () => {
        it('should return false when canUse is false', async () => {
            let itemData = {...UsableItemsFixtures.healthPotion, manager: manager};
            let item = new Usable(itemData);
            item.canUse = false;
            let result = await item.use(mockOwner);
            assert.strictEqual(result, false);
        });

        it('should return false when no uses remaining', async () => {
            let itemData = {...UsableItemsFixtures.healthPotion, manager: manager};
            let item = new Usable(itemData);
            item.currentUses = 0;
            let result = await item.use(mockOwner);
            assert.strictEqual(result, false);
        });

        it('should set target when provided', async () => {
            let itemData = {...UsableItemsFixtures.simpleUsable, manager: manager};
            let item = new Usable(itemData);
            await item.use(mockOwner);
            assert.strictEqual(item.target, mockOwner);
        });
    });

    describe('executeItem', () => {
        it('should decrease currentUses', async () => {
            let itemData = {...UsableItemsFixtures.simpleUsable, manager: manager, uses: 3};
            let item = new Usable(itemData);
            item.target = mockOwner;
            item.removeAfterUse = false;
            await item.executeItem();
            assert.strictEqual(item.currentUses, 2);
        });

        it('should apply modifiers', async () => {
            let applyCalled = 0;
            let mockModifiers = {
                mod1: {apply: () => { applyCalled++; }}
            };
            let itemData = {...UsableItemsFixtures.healthPotion, manager: manager, modifiers: mockModifiers};
            let item = new Usable(itemData);
            item.target = mockOwner;
            item.removeAfterUse = false;
            await item.executeItem();
            assert.strictEqual(applyCalled, 1);
        });
    });
});
