/**
 *
 * Reldens - ItemGrowthCalculator Unit Tests
 *
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const ItemGrowthCalculator = require('../../../../lib/item/growth/item-growth-calculator');
const ItemsConst = require('../../../../lib/constants');
const { EquipmentItemsFixtures } = require('../../../fixtures/items/equipment-items');
const { sc } = require('@reldens/utils');

describe('ItemGrowthCalculator', () => {
    let growth = sc.toJson(EquipmentItemsFixtures.growingSword.customData).growth;

    describe('experienceFor', () => {
        it('should give the configured share of the experience gained, rounded down', () => {
            assert.strictEqual(ItemGrowthCalculator.experienceFor(100, 40), 40);
            assert.strictEqual(ItemGrowthCalculator.experienceFor(growth.experienceShare, 40), 20);
            assert.strictEqual(ItemGrowthCalculator.experienceFor(growth.experienceShare, 7), 3);
            assert.strictEqual(ItemGrowthCalculator.experienceFor('50', '7'), 3);
            assert.strictEqual(ItemGrowthCalculator.experienceFor(growth.experienceShare, 1), 0);
        });

        it('should give the whole experience when the share is missing or not a number', () => {
            assert.strictEqual(ItemGrowthCalculator.experienceFor(growth.missingShare, 40), 40);
            assert.strictEqual(ItemGrowthCalculator.experienceFor('half', 40), 40);
        });

        it('should give no experience for a zero or negative share and a zero, negative or invalid experience', () => {
            assert.strictEqual(ItemGrowthCalculator.experienceFor(0, 40), 0);
            assert.strictEqual(ItemGrowthCalculator.experienceFor(-50, 40), 0);
            assert.strictEqual(ItemGrowthCalculator.experienceFor(100, 0), 0);
            assert.strictEqual(ItemGrowthCalculator.experienceFor(100, -5), 0);
            assert.strictEqual(ItemGrowthCalculator.experienceFor(100, 'many'), 0);
        });
    });

    describe('levelFor', () => {
        it('should reach the highest level its experience covers, including the exact required experience', () => {
            assert.strictEqual(ItemGrowthCalculator.levelFor(growth.levels['2'] - 1, growth.levels, 1), 1);
            assert.strictEqual(ItemGrowthCalculator.levelFor(growth.levels['2'], growth.levels, 1), 2);
            assert.strictEqual(ItemGrowthCalculator.levelFor(growth.levels['4'] + 5, growth.levels, 1), 4);
            assert.strictEqual(ItemGrowthCalculator.levelFor(growth.levels['5'] * 2, growth.levels, 1), 5);
        });

        it('should never go below the current level', () => {
            assert.strictEqual(ItemGrowthCalculator.levelFor(growth.levels['2'], growth.levels, 3), 3);
            assert.strictEqual(ItemGrowthCalculator.levelFor(growth.levels['5'] * 2, growth.levels, 7), 7);
        });

        it('should keep the current level without levels and start from the default level without one', () => {
            assert.strictEqual(ItemGrowthCalculator.levelFor(10, false, 2), 2);
            assert.strictEqual(ItemGrowthCalculator.levelFor(10, {}, 2), 2);
            assert.strictEqual(ItemGrowthCalculator.levelFor(0, growth.levels, 0), ItemsConst.GROWTH.DEFAULT_LEVEL);
            assert.strictEqual(ItemGrowthCalculator.levelFor(0, growth.levels, null), ItemsConst.GROWTH.DEFAULT_LEVEL);
        });

        it('should ignore the levels that are not numbers', () => {
            assert.strictEqual(ItemGrowthCalculator.levelFor(100, {'max': 1, '2': 5}, 1), 2);
        });
    });

    describe('scaledValue', () => {
        it('should increase the original value by the percent on every level after the first, rounded', () => {
            let percent = growth.modifiersIncreasePercentPerLevel;
            assert.strictEqual(ItemGrowthCalculator.scaledValue(10, ItemsConst.GROWTH.DEFAULT_LEVEL, percent), 10);
            assert.strictEqual(ItemGrowthCalculator.scaledValue(10, 2, percent), 15);
            assert.strictEqual(ItemGrowthCalculator.scaledValue(10, 5, percent), 30);
            assert.strictEqual(ItemGrowthCalculator.scaledValue(3, 2, percent), 5);
            assert.strictEqual(ItemGrowthCalculator.scaledValue('10', '2', String(percent)), 15);
        });

        it('should keep the original value without a percent or below the default level', () => {
            assert.strictEqual(ItemGrowthCalculator.scaledValue(10, 4, false), 10);
            assert.strictEqual(ItemGrowthCalculator.scaledValue(10, 4, 'many'), 10);
            assert.strictEqual(ItemGrowthCalculator.scaledValue(10, 0, growth.modifiersIncreasePercentPerLevel), 10);
            assert.strictEqual(ItemGrowthCalculator.scaledValue(10, 'many', growth.modifiersIncreasePercentPerLevel), 10);
        });

        it('should keep the decimals of a decimal value', () => {
            let percent = growth.modifiersIncreasePercentPerLevel;
            assert.strictEqual(ItemGrowthCalculator.scaledValue(1.5, ItemsConst.GROWTH.DEFAULT_LEVEL, percent), 1.5);
            assert.strictEqual(ItemGrowthCalculator.scaledValue(1.5, 2, percent), 2.25);
            assert.strictEqual(ItemGrowthCalculator.scaledValue(-0.5, 3, percent), -1);
        });

        it('should round the negative integer values like the positive values', () => {
            let percent = growth.modifiersIncreasePercentPerLevel;
            assert.strictEqual(ItemGrowthCalculator.scaledValue(-3, 2, percent), -5);
            assert.strictEqual(ItemGrowthCalculator.scaledValue(-10, 5, percent), -30);
            assert.strictEqual(ItemGrowthCalculator.scaledValue(0, 5, percent), 0);
        });

        it('should never scale a value that is not a number', () => {
            let percent = growth.modifiersIncreasePercentPerLevel;
            assert.strictEqual(ItemGrowthCalculator.scaledValue('many', 2, percent), 'many');
            assert.strictEqual(ItemGrowthCalculator.scaledValue('10 atk', 3, percent), '10 atk');
        });
    });
});
