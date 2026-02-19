/**
 *
 * Reldens - Exchange Requirements and Rewards Unit Tests
 *
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const ExchangeRequirement = require('../../../lib/exchange/exchange-requirement');
const ExchangeReward = require('../../../lib/exchange/exchange-reward');
const RequirementsCollection = require('../../../lib/exchange/requirements-collection');
const RewardsCollection = require('../../../lib/exchange/rewards-collection');
const { TestHelpers } = require('../../utils/test-helpers');

describe('Exchange Requirements and Rewards', () => {

    beforeEach(() => {
        TestHelpers.clearEventListeners();
    });

    afterEach(() => {
        TestHelpers.clearEventListeners();
    });

    describe('ExchangeRequirement', () => {
        it('should initialize with required properties', () => {
            let requirement = new ExchangeRequirement({
                itemUid: 'item-uid-1',
                itemKey: 'item-key-1',
                requiredItemKey: 'gold',
                requiredQuantity: 100
            });
            assert.strictEqual(requirement.itemUid, 'item-uid-1');
            assert.strictEqual(requirement.itemKey, 'item-key-1');
            assert.strictEqual(requirement.requiredItemKey, 'gold');
            assert.strictEqual(requirement.requiredQuantity, 100);
        });

        it('should handle autoRemoveRequirement flag', () => {
            let requirement = new ExchangeRequirement({
                requiredItemKey: 'gold',
                requiredQuantity: 50,
                autoRemoveRequirement: true
            });
            assert.strictEqual(requirement.autoRemoveRequirement, true);
        });

        it('should default autoRemoveRequirement to false', () => {
            let requirement = new ExchangeRequirement({
                requiredItemKey: 'gold',
                requiredQuantity: 50
            });
            assert.strictEqual(requirement.autoRemoveRequirement, false);
        });

        it('should convert quantity to number', () => {
            let requirement = new ExchangeRequirement({
                requiredItemKey: 'gold',
                requiredQuantity: '75'
            });
            assert.strictEqual(requirement.requiredQuantity, 75);
            assert.strictEqual(typeof requirement.requiredQuantity, 'number');
        });

        it('should handle empty itemUid and itemKey', () => {
            let requirement = new ExchangeRequirement({
                requiredItemKey: 'gold',
                requiredQuantity: 10
            });
            assert.strictEqual(requirement.itemUid, '');
            assert.strictEqual(requirement.itemKey, '');
        });
    });

    describe('ExchangeReward', () => {
        it('should initialize with required properties', () => {
            let reward = new ExchangeReward({
                itemUid: 'item-uid-1',
                itemKey: 'item-key-1',
                rewardItemKey: 'gem',
                rewardQuantity: 5
            });
            assert.strictEqual(reward.itemUid, 'item-uid-1');
            assert.strictEqual(reward.itemKey, 'item-key-1');
            assert.strictEqual(reward.rewardItemKey, 'gem');
            assert.strictEqual(reward.rewardQuantity, 5);
        });

        it('should handle rewardItemIsRequired flag', () => {
            let reward = new ExchangeReward({
                rewardItemKey: 'gem',
                rewardQuantity: 3,
                rewardItemIsRequired: true
            });
            assert.strictEqual(reward.rewardItemIsRequired, true);
        });

        it('should default rewardItemIsRequired to false', () => {
            let reward = new ExchangeReward({
                rewardItemKey: 'gem',
                rewardQuantity: 3
            });
            assert.strictEqual(reward.rewardItemIsRequired, false);
        });

        it('should convert quantity to number', () => {
            let reward = new ExchangeReward({
                rewardItemKey: 'gem',
                rewardQuantity: '10'
            });
            assert.strictEqual(reward.rewardQuantity, 10);
            assert.strictEqual(typeof reward.rewardQuantity, 'number');
        });

        it('should handle empty itemUid and itemKey', () => {
            let reward = new ExchangeReward({
                rewardItemKey: 'gem',
                rewardQuantity: 1
            });
            assert.strictEqual(reward.itemUid, '');
            assert.strictEqual(reward.itemKey, '');
        });
    });

    describe('RequirementsCollection', () => {
        it('should initialize as empty collection', () => {
            let collection = new RequirementsCollection();
            assert.ok(collection);
            assert.ok(collection.requirements);
        });

        it('should add requirements', () => {
            let collection = new RequirementsCollection();
            collection.add('item-uid-1', 'item-key-1', 'gold', 100, false);
            assert.strictEqual(collection.requirements.length, 1);
        });

        it('should count requirements', () => {
            let collection = new RequirementsCollection();
            collection.add('item-uid-1', 'item-key-1', 'gold', 50, false);
            collection.add('item-uid-2', 'item-key-2', 'silver', 100, false);
            assert.strictEqual(collection.count(), 2);
        });
    });

    describe('RewardsCollection', () => {
        it('should initialize as empty collection', () => {
            let collection = new RewardsCollection();
            assert.ok(collection);
            assert.ok(collection.rewards);
        });

        it('should add rewards', () => {
            let collection = new RewardsCollection();
            collection.add('item-uid-1', 'item-key-1', 'gem', 5, false);
            assert.strictEqual(collection.rewards.length, 1);
        });

        it('should count rewards', () => {
            let collection = new RewardsCollection();
            collection.add('item-uid-1', 'item-key-1', 'gem', 3, false);
            collection.add('item-uid-2', 'item-key-2', 'diamond', 1, false);
            assert.strictEqual(collection.count(), 2);
        });
    });
});
