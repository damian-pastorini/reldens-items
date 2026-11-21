/**
 *
 * Reldens - RewardsProcessor Unit Tests
 *
 * Tests processItemRewards with real items managers: a required reward item is taken from the inventory that owns it
 * with the same total quantity (reward quantity by the pushed quantity) the other inventory receives, and a total
 * bigger than the owned quantity fails with the quantity overload error and changes no inventory.
 *
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const ExchangePlatform = require('../../../lib/exchange/exchange-platform');
const ExchangeReward = require('../../../lib/exchange/exchange-reward');
const ItemBase = require('../../../lib/item/type/item-base');
const ItemSingle = require('../../../lib/item/type/single');
const ItemsManager = require('../../../lib/manager');
const ItemsConst = require('../../../lib/constants');
const { TestHelpers } = require('../../utils/test-helpers');
const { MockOwner } = require('../../fixtures/mocks/mock-owner');

describe('RewardsProcessor', () => {
    let itemsModelData;
    let seller;
    let trader;
    let platform;
    let soldItemUid;

    let createManager = (key) => new ItemsManager({key, owner_id: key, owner: new MockOwner(key), itemsModelData});

    let processRequiredReward = async (pushedQuantity) => {
        let reward = new ExchangeReward({
            itemKey: 'test-axe',
            rewardItemKey: 'test-coins',
            rewardQuantity: 2,
            rewardItemIsRequired: true
        });
        return platform.rewardsProcessor.processItemRewards(
            [reward],
            seller,
            trader,
            'B',
            pushedQuantity,
            soldItemUid,
            platform
        );
    };

    beforeEach(async () => {
        TestHelpers.clearEventListeners();
        itemsModelData = {
            'test-axe': {class: ItemBase, data: {id: 1, key: 'test-axe', label: 'Axe', qty: 1}},
            'test-coins': {
                class: ItemSingle,
                data: {id: 2, key: 'test-coins', label: 'Coins', qty: 1, type: ItemsConst.TYPES.SINGLE}
            }
        };
        seller = createManager('seller');
        trader = createManager('trader');
        await seller.addItem(seller.createItemInstance('test-axe'));
        soldItemUid = Object.keys(seller.items)[0];
        platform = new ExchangePlatform({});
        platform.inventories = {A: seller, B: trader};
    });

    afterEach(() => {
        TestHelpers.clearEventListeners();
    });

    it('should take the required reward total from the owner and give it to the other inventory', async () => {
        await trader.addItem(trader.createItemInstance('test-coins', 10));
        let results = [];
        for(let pushedQuantity of [1, 2]){
            results.push([
                await processRequiredReward(pushedQuantity),
                trader.findItemByKey('test-coins').qty,
                seller.findItemByKey('test-coins').qty
            ]);
        }
        assert.deepStrictEqual(results, [[true, 8, 2], [true, 4, 6]]);
    });

    it('should fail with the quantity overload when the owner has less than the total', async () => {
        await trader.addItem(trader.createItemInstance('test-coins', 3));
        let result = await processRequiredReward(2);
        assert.deepStrictEqual(
            [result, platform.lastError.code, trader.findItemByKey('test-coins').qty, seller.findItemByKey('test-coins')],
            [false, ItemsConst.ERROR_CODES.REWARD.QUANTITY_OVERLOAD, 3, false]
        );
    });
});
