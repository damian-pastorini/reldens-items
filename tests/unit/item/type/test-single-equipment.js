/**
 *
 * Reldens - SingleEquipment Unit Tests
 *
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const SingleEquipment = require('../../../../lib/item/type/single-equipment');
const ItemsManager = require('../../../../lib/manager');
const ItemsConst = require('../../../../lib/constants');
const { TestHelpers } = require('../../../utils/test-helpers');
const { EquipmentItemsFixtures } = require('../../../fixtures/items/equipment-items');
const { MockOwner } = require('../../../fixtures/mocks/mock-owner');

describe('SingleEquipment', () => {
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
            let itemData = {...EquipmentItemsFixtures.singleEquipment, manager: manager};
            let item = new SingleEquipment(itemData);
            assert.strictEqual(item.singleInstance, true);
        });

        it('should maintain equipment type', () => {
            let itemData = {...EquipmentItemsFixtures.singleEquipment, manager: manager};
            let item = new SingleEquipment(itemData);
            assert.strictEqual(item.type, ItemsConst.TYPES.EQUIPMENT);
        });
    });

    describe('Equip functionality', () => {
        it('should be able to equip and unequip', async () => {
            let itemData = {...EquipmentItemsFixtures.singleEquipment, manager: manager};
            let item = new SingleEquipment(itemData);
            await item.equip();
            assert.strictEqual(item.equipped, true);
            await item.unequip();
            assert.strictEqual(item.equipped, false);
        });
    });
});
