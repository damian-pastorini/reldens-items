/**
 *
 * Reldens - ExchangePlatform Unit Tests
 *
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const ExchangePlatform = require('../../../lib/exchange/exchange-platform');
const RequirementsCollection = require('../../../lib/exchange/requirements-collection');
const RewardsCollection = require('../../../lib/exchange/rewards-collection');
const Inventory = require('../../../lib/item/inventory');
const ItemBase = require('../../../lib/item/type/item-base');
const ItemsManager = require('../../../lib/manager');
const ItemsConst = require('../../../lib/constants');
const ItemsEvents = require('../../../lib/items-events');
const { TestHelpers } = require('../../utils/test-helpers');
const { BaseItemsFixtures } = require('../../fixtures/items/base-items');
const { MockOwner } = require('../../fixtures/mocks/mock-owner');

describe('ExchangePlatform', () => {
    let platform;
    let inventoryA;
    let inventoryB;
    let managerA;
    let managerB;
    let ownerA;
    let ownerB;

    beforeEach(() => {
        ownerA = new MockOwner('owner-a');
        ownerB = new MockOwner('owner-b');
        managerA = new ItemsManager({owner: ownerA});
        managerB = new ItemsManager({owner: ownerB});
        inventoryA = new Inventory({key: 'inv-a', owner_id: 'owner-a'});
        inventoryB = new Inventory({key: 'inv-b', owner_id: 'owner-b'});
        platform = new ExchangePlatform({});
        TestHelpers.clearEventListeners();
    });

    afterEach(() => {
        TestHelpers.clearEventListeners();
    });

    describe('Constructor', () => {
        it('should initialize with default properties', () => {
            assert.ok(platform.events);
            assert.ok(platform.requirementsProcessor);
            assert.ok(platform.rewardsProcessor);
        });

        it('should initialize inventories as null', () => {
            assert.strictEqual(platform.inventories.A, null);
            assert.strictEqual(platform.inventories.B, null);
        });

        it('should initialize confirmations as false', () => {
            assert.strictEqual(platform.confirmations.A, false);
            assert.strictEqual(platform.confirmations.B, false);
        });

        it('should set custom exchangeInitializerId', () => {
            let customPlatform = new ExchangePlatform({exchangeInitializerId: 'custom-id'});
            assert.strictEqual(customPlatform.exchangeInitializerId, 'custom-id');
        });
    });

    describe('initializeExchangeBetween', () => {
        it('should set inventories', () => {
            platform.initializeExchangeBetween({inventoryA, inventoryB});
            assert.strictEqual(platform.inventories.A, inventoryA);
            assert.strictEqual(platform.inventories.B, inventoryB);
        });

        it('should lock inventories', () => {
            platform.initializeExchangeBetween({inventoryA, inventoryB});
            assert.strictEqual(inventoryA.locked, true);
            assert.strictEqual(inventoryB.locked, true);
        });

        it('should reset confirmations', () => {
            platform.initializeExchangeBetween({inventoryA, inventoryB});
            assert.strictEqual(platform.confirmations.A, false);
            assert.strictEqual(platform.confirmations.B, false);
        });

        it('should use custom requirements collections', () => {
            let reqA = new RequirementsCollection();
            let reqB = new RequirementsCollection();
            platform.initializeExchangeBetween({
                inventoryA,
                inventoryB,
                exchangeRequirementsA: reqA,
                exchangeRequirementsB: reqB
            });
            assert.strictEqual(platform.exchangeRequirements.A, reqA);
            assert.strictEqual(platform.exchangeRequirements.B, reqB);
        });

        it('should use custom rewards collections', () => {
            let rewA = new RewardsCollection();
            let rewB = new RewardsCollection();
            platform.initializeExchangeBetween({
                inventoryA,
                inventoryB,
                exchangeRewardsA: rewA,
                exchangeRewardsB: rewB
            });
            assert.strictEqual(platform.exchangeRewards.A, rewA);
            assert.strictEqual(platform.exchangeRewards.B, rewB);
        });

        it('should set dropExchange flags', () => {
            platform.initializeExchangeBetween({
                inventoryA,
                inventoryB,
                dropExchangeA: true,
                dropExchangeB: false
            });
            assert.strictEqual(platform.dropExchange.A, true);
            assert.strictEqual(platform.dropExchange.B, false);
        });
    });

    describe('pushForExchange', () => {
        beforeEach(async () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: managerA};
            let item = new ItemBase(itemData);
            await inventoryA.addItem(item);
            platform.initializeExchangeBetween({inventoryA, inventoryB});
        });

        it('should add item to exchange', async () => {
            let itemUid = Object.keys(inventoryA.items)[0];
            let result = await platform.pushForExchange(itemUid, 1, 'A');
            assert.strictEqual(result, true);
            assert.strictEqual(platform.exchangeBetween.A[itemUid], 1);
        });

        it('should reject push when already confirmed', async () => {
            let itemUid = Object.keys(inventoryA.items)[0];
            platform.confirmations.A = true;
            let result = await platform.pushForExchange(itemUid, 1, 'A');
            assert.strictEqual(result, false);
        });

        it('should reject invalid quantity', async () => {
            let itemUid = Object.keys(inventoryA.items)[0];
            let result = await platform.pushForExchange(itemUid, 999, 'A');
            assert.strictEqual(result, false);
        });

        it('should reject non-existent item', async () => {
            let result = await platform.pushForExchange('fake-uid', 1, 'A');
            assert.strictEqual(result, false);
        });
    });

    describe('removeFromExchange', () => {
        beforeEach(async () => {
            let itemData = {...BaseItemsFixtures.basicItem, manager: managerA};
            let item = new ItemBase(itemData);
            await inventoryA.addItem(item);
            platform.initializeExchangeBetween({inventoryA, inventoryB});
        });

        it('should remove item from exchange', async () => {
            let itemUid = Object.keys(inventoryA.items)[0];
            await platform.pushForExchange(itemUid, 1, 'A');
            let result = await platform.removeFromExchange(itemUid, 'A');
            assert.strictEqual(result, true);
            assert.strictEqual(platform.exchangeBetween.A[itemUid], undefined);
        });

        it('should return false when removing non-existent item', async () => {
            let result = await platform.removeFromExchange('fake-uid', 'A');
            assert.strictEqual(result, false);
        });

        it('should block removal when confirmed', async () => {
            let itemUid = Object.keys(inventoryA.items)[0];
            await platform.pushForExchange(itemUid, 1, 'A');
            platform.confirmations.A = true;
            let result = await platform.removeFromExchange(itemUid, 'A');
            assert.strictEqual(result, false);
        });
    });

    describe('confirmExchange', () => {
        it('should set confirmation to true', async () => {
            platform.initializeExchangeBetween({inventoryA, inventoryB});
            await platform.confirmExchange('A');
            assert.strictEqual(platform.confirmations.A, true);
        });

        it('should maintain separate confirmations', async () => {
            platform.initializeExchangeBetween({inventoryA, inventoryB});
            await platform.confirmExchange('A');
            assert.strictEqual(platform.confirmations.A, true);
            assert.strictEqual(platform.confirmations.B, false);
        });
    });

    describe('disconfirmExchange', () => {
        it('should set confirmation to false', async () => {
            platform.initializeExchangeBetween({inventoryA, inventoryB});
            platform.confirmations.A = true;
            await platform.disconfirmExchange('A');
            assert.strictEqual(platform.confirmations.A, false);
        });
    });

    describe('cancelExchange', () => {
        it('should unlock inventories', () => {
            platform.initializeExchangeBetween({inventoryA, inventoryB});
            platform.cancelExchange();
            assert.strictEqual(inventoryA.locked, false);
            assert.strictEqual(inventoryB.locked, false);
        });

        it('should reset properties', () => {
            platform.initializeExchangeBetween({inventoryA, inventoryB});
            platform.cancelExchange();
            assert.strictEqual(platform.inventories.A, null);
            assert.strictEqual(platform.inventories.B, null);
        });
    });

    describe('finalizeExchange', () => {
        it('should fail without confirmations', async () => {
            platform.initializeExchangeBetween({inventoryA, inventoryB});
            let result = await platform.finalizeExchange();
            assert.strictEqual(result, false);
            assert.strictEqual(platform.lastError.code, ItemsConst.ERROR_CODES.EXCHANGE.MISSING_CONFIRMATION);
        });

        it('should fail with only one confirmation', async () => {
            platform.initializeExchangeBetween({inventoryA, inventoryB});
            await platform.confirmExchange('A');
            let result = await platform.finalizeExchange();
            assert.strictEqual(result, false);
        });
    });

    describe('lockInventories', () => {
        it('should lock both inventories', () => {
            platform.inventories.A = inventoryA;
            platform.inventories.B = inventoryB;
            platform.lockInventories();
            assert.strictEqual(inventoryA.locked, true);
            assert.strictEqual(inventoryB.locked, true);
        });
    });

    describe('unlockInventories', () => {
        it('should unlock both inventories', () => {
            platform.inventories.A = inventoryA;
            platform.inventories.B = inventoryB;
            inventoryA.locked = true;
            inventoryB.locked = true;
            platform.unlockInventories();
            assert.strictEqual(inventoryA.locked, false);
            assert.strictEqual(inventoryB.locked, false);
        });
    });
});
