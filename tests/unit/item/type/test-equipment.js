/**
 *
 * Reldens - Equipment Unit Tests
 *
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const Equipment = require('../../../../lib/item/type/equipment');
const ItemsManager = require('../../../../lib/manager');
const ItemsConst = require('../../../../lib/constants');
const { TestHelpers } = require('../../../utils/test-helpers');
const { EquipmentItemsFixtures } = require('../../../fixtures/items/equipment-items');
const { MockOwner } = require('../../../fixtures/mocks/mock-owner');

describe('Equipment', () => {
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
        it('should initialize as equipment type', () => {
            let itemData = {...EquipmentItemsFixtures.basicSword, manager: manager};
            let item = new Equipment(itemData);
            assert.strictEqual(item.type, ItemsConst.TYPES.EQUIPMENT);
            assert.strictEqual(item.equipped, false);
        });

        it('should initialize with equipped status', () => {
            let itemData = {...EquipmentItemsFixtures.basicSword, manager: manager, equipped: true};
            let item = new Equipment(itemData);
            assert.strictEqual(item.equipped, true);
        });
    });

    describe('equip', () => {
        it('should set equipped to true', async () => {
            let itemData = {...EquipmentItemsFixtures.simpleEquipment, manager: manager};
            let item = new Equipment(itemData);
            await item.equip();
            assert.strictEqual(item.equipped, true);
        });

        it('should not apply modifiers when applyMods is false', async () => {
            let applyCalled = false;
            let mockModifiers = {
                mod1: {apply: () => { applyCalled = true; }}
            };
            let itemData = {...EquipmentItemsFixtures.basicSword, manager: manager, modifiers: mockModifiers};
            let item = new Equipment(itemData);
            item.target = mockOwner;
            await item.equip(false);
            assert.strictEqual(applyCalled, false);
        });

        it('should apply modifiers automatically by default', async () => {
            let applyCalled = 0;
            let mockModifiers = {
                mod1: {apply: () => { applyCalled++; }}
            };
            let itemData = {...EquipmentItemsFixtures.basicSword, manager: manager, modifiers: mockModifiers};
            let item = new Equipment(itemData);
            item.target = mockOwner;
            await item.equip();
            assert.strictEqual(applyCalled, 1);
        });
    });

    describe('unequip', () => {
        it('should set equipped to false', async () => {
            let itemData = {...EquipmentItemsFixtures.simpleEquipment, manager: manager, equipped: true};
            let item = new Equipment(itemData);
            await item.unequip();
            assert.strictEqual(item.equipped, false);
        });

        it('should not revert modifiers when revertMods is false', async () => {
            let revertCalled = false;
            let mockModifiers = {
                mod1: {
                    apply: () => {},
                    revert: () => { revertCalled = true; }
                }
            };
            let itemData = {
                ...EquipmentItemsFixtures.basicSword,
                manager: manager,
                modifiers: mockModifiers,
                equipped: true
            };
            let item = new Equipment(itemData);
            item.target = mockOwner;
            await item.unequip(false);
            assert.strictEqual(revertCalled, false);
        });

        it('should revert modifiers automatically by default', async () => {
            let revertCalled = 0;
            let mockModifiers = {
                mod1: {
                    apply: () => {},
                    revert: () => { revertCalled++; }
                }
            };
            let itemData = {
                ...EquipmentItemsFixtures.basicSword,
                manager: manager,
                modifiers: mockModifiers,
                equipped: true
            };
            let item = new Equipment(itemData);
            item.target = mockOwner;
            await item.unequip();
            assert.strictEqual(revertCalled, 1);
        });
    });

    describe('applyModifiers', () => {
        it('should fail when item is not equipped', async () => {
            let itemData = {...EquipmentItemsFixtures.basicSword, manager: manager};
            let item = new Equipment(itemData);
            let result = await item.applyModifiers();
            assert.strictEqual(result, false);
            assert.strictEqual(manager.lastError.code, ItemsConst.ERROR_CODES.EQUIPMENT.MODIFIERS_APPLY);
        });

        it('should apply modifiers when equipped', async () => {
            let applyCalled = 0;
            let mockModifiers = {
                mod1: {apply: () => { applyCalled++; }}
            };
            let itemData = {
                ...EquipmentItemsFixtures.basicSword,
                manager: manager,
                modifiers: mockModifiers,
                equipped: true
            };
            let item = new Equipment(itemData);
            item.target = mockOwner;
            await item.applyModifiers();
            assert.strictEqual(applyCalled, 1);
        });
    });

    describe('revertModifiers', () => {
        it('should fail when item is still equipped', async () => {
            let itemData = {...EquipmentItemsFixtures.basicSword, manager: manager, equipped: true};
            let item = new Equipment(itemData);
            let result = await item.revertModifiers();
            assert.strictEqual(result, false);
            assert.strictEqual(manager.lastError.code, ItemsConst.ERROR_CODES.EQUIPMENT.MODIFIERS_REVERT);
        });

        it('should revert modifiers when not equipped', async () => {
            let revertCalled = 0;
            let mockModifiers = {
                mod1: {
                    apply: () => {},
                    revert: () => { revertCalled++; }
                }
            };
            let itemData = {
                ...EquipmentItemsFixtures.basicSword,
                manager: manager,
                modifiers: mockModifiers,
                equipped: false
            };
            let item = new Equipment(itemData);
            item.target = mockOwner;
            await item.revertModifiers();
            assert.strictEqual(revertCalled, 1);
        });
    });
});
