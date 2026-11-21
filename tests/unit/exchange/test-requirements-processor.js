/**
 *
 * Reldens - RequirementsProcessor Unit Tests
 *
 * Tests validateRequirements with real items managers: the pushed items are valid only when the other inventory owns
 * the total required by all of them together, so two items affordable one by one but not together are refused with the
 * quantity not available error and the summed total.
 *
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const ExchangePlatform = require('../../../lib/exchange/exchange-platform');
const RequirementsCollection = require('../../../lib/exchange/requirements-collection');
const ItemBase = require('../../../lib/item/type/item-base');
const ItemSingle = require('../../../lib/item/type/single');
const ItemsManager = require('../../../lib/manager');
const ItemsConst = require('../../../lib/constants');
const { TestHelpers } = require('../../utils/test-helpers');
const { MockOwner } = require('../../fixtures/mocks/mock-owner');

describe('RequirementsProcessor', () => {
    let itemsModelData;

    let createManager = (key) => new ItemsManager({key, owner_id: key, owner: new MockOwner(key), itemsModelData});

    let validateBuy = async (ownedCoins) => {
        let trader = createManager('trader');
        let buyer = createManager('buyer');
        await trader.addItem(trader.createItemInstance('test-axe'));
        await trader.addItem(trader.createItemInstance('test-spear'));
        await buyer.addItem(buyer.createItemInstance('test-coins', ownedCoins));
        let requirements = new RequirementsCollection();
        requirements.add('', 'test-axe', 'test-coins', 5, true);
        requirements.add('', 'test-spear', 'test-coins', 2, true);
        let platform = new ExchangePlatform({});
        platform.inventories = {A: trader, B: buyer};
        platform.exchangeBetween = {A: {}, B: {}};
        for(let itemUid of Object.keys(trader.items)){
            platform.exchangeBetween.A[itemUid] = 1;
        }
        platform.exchangeRequirements = {A: requirements, B: new RequirementsCollection()};
        let isValid = platform.validateRequirements('A');
        return [isValid, platform.lastError.code, platform.lastError.data.totalRequiredQuantity];
    };

    beforeEach(() => {
        TestHelpers.clearEventListeners();
        itemsModelData = {
            'test-axe': {class: ItemBase, data: {id: 1, key: 'test-axe', label: 'Axe', qty: 1}},
            'test-spear': {class: ItemBase, data: {id: 2, key: 'test-spear', label: 'Spear', qty: 1}},
            'test-coins': {
                class: ItemSingle,
                data: {id: 3, key: 'test-coins', label: 'Coins', qty: 1, type: ItemsConst.TYPES.SINGLE}
            }
        };
    });

    afterEach(() => {
        TestHelpers.clearEventListeners();
    });

    it('should refuse items affordable one by one but not together', async () => {
        assert.deepStrictEqual(
            await validateBuy(6),
            [false, ItemsConst.ERROR_CODES.REQUIREMENTS.QUANTITY_NOT_AVAILABLE, 7]
        );
    });

    it('should accept the items when the total required is owned', async () => {
        assert.deepStrictEqual((await validateBuy(7)).shift(), true);
    });
});
