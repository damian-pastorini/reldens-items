/**
 *
 * Reldens - ItemGrowthLeveler Unit Tests
 *
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const ItemGrowthLeveler = require('../../../../lib/item/growth/item-growth-leveler');
const ItemBase = require('../../../../lib/item/type/item-base');
const ItemsManager = require('../../../../lib/manager');
const ItemsConst = require('../../../../lib/constants');
const ItemsEvents = require('../../../../lib/items-events');
const { TestHelpers } = require('../../../utils/test-helpers');
const { EquipmentItemsFixtures } = require('../../../fixtures/items/equipment-items');
const { BaseItemsFixtures } = require('../../../fixtures/items/base-items');
const { MockOwner } = require('../../../fixtures/mocks/mock-owner');
const { Modifier, ModifierConst } = require('@reldens/modifiers');
const { EventsManager, sc } = require('@reldens/utils');

describe('ItemGrowthLeveler', () => {
    let growth = sc.toJson(EquipmentItemsFixtures.growingSword.customData).growth;
    let recordedEvents = [
        ItemsEvents.UNEQUIP_ITEM,
        ItemsEvents.GROWTH_LEVEL_UP,
        ItemsEvents.UPDATE_ITEM,
        ItemsEvents.EQUIP_ITEM,
        ItemsEvents.GROWTH_EXPERIENCE_ADDED
    ];
    let levelUpWithoutEquipmentEvents = [
        ItemsEvents.GROWTH_LEVEL_UP,
        ItemsEvents.UPDATE_ITEM,
        ItemsEvents.GROWTH_EXPERIENCE_ADDED
    ];
    let notRequiredEquipmentCustomData = sc.toJsonString({growth: Object.assign({}, growth, {requireEquipped: false})});
    let levelUpFailures = [
        {failedEvent: ItemsEvents.GROWTH_LEVEL_UP, stepName: ItemsEvents.GROWTH_LEVEL_UP, ownerAttack: 25},
        {failedEvent: ItemsEvents.UPDATE_ITEM, stepName: ItemsEvents.UPDATE_ITEM, ownerAttack: 25},
        {failedEvent: ItemsEvents.EQUIP_ITEM, stepName: 'equip', ownerAttack: 10}
    ];
    let manager;
    let leveler;
    let firedEvents;

    beforeEach(() => {
        manager = new ItemsManager({owner: new MockOwner(), eventsManager: new EventsManager()});
        leveler = new ItemGrowthLeveler();
        firedEvents = TestHelpers.recordEvents(manager, recordedEvents);
    });

    describe('initializeItem', () => {
        it('should start a new growing item at the default level with its original modifiers values', () => {
            let sword = TestHelpers.createGrowingSword(manager);
            sword.modifiers.attack.value = 99;
            assert.strictEqual(leveler.initializeItem(sword), true);
            assert.strictEqual(sword.growthLevel, ItemsConst.GROWTH.DEFAULT_LEVEL);
            assert.strictEqual(sword.growthExperience, 0);
            assert.strictEqual(sword.modifiers.attack.value, sword.modifiers.attack.originalValue);
            assert.deepStrictEqual(firedEvents, []);
        });

        it('should scale the modifiers to the stored level and keep the stored experience', () => {
            let sword = TestHelpers.createGrowingSword(manager);
            assert.strictEqual(leveler.initializeItem(sword, 2, 12), true);
            assert.strictEqual(sword.growthLevel, 2);
            assert.strictEqual(sword.growthExperience, 12);
            assert.strictEqual(sword.modifiers.attack.value, 15);
            assert.strictEqual(leveler.initializeItem(sword, '3', '40'), true);
            assert.strictEqual(sword.growthLevel, 3);
            assert.strictEqual(sword.growthExperience, 40);
            assert.strictEqual(sword.modifiers.attack.value, 20);
        });

        it('should use the default level and no experience for missing or invalid stored values', () => {
            let sword = TestHelpers.createGrowingSword(manager);
            for(let invalidValue of [null, 0, 'many', '']){
                assert.strictEqual(leveler.initializeItem(sword, invalidValue, invalidValue), true);
                assert.strictEqual(sword.growthLevel, ItemsConst.GROWTH.DEFAULT_LEVEL);
                assert.strictEqual(sword.growthExperience, 0);
                assert.strictEqual(sword.modifiers.attack.value, 10);
            }
        });

        it('should not initialize the items without growth', () => {
            let basicItem = new ItemBase({...BaseItemsFixtures.basicItem, manager});
            assert.strictEqual(leveler.initializeItem(basicItem, 2, 12), false);
            assert.strictEqual(sc.hasOwn(basicItem, 'growthLevel'), false);
            assert.strictEqual(sc.hasOwn(basicItem, 'growthExperience'), false);
            assert.strictEqual(leveler.initializeItem(null), false);
            assert.strictEqual(leveler.initializeItem(false), false);
        });

        it('should never scale the set, method and set n operations', () => {
            let owner = manager.owner;
            let sword = TestHelpers.createGrowingSword(manager);
            sword.modifiers.multiplier = new Modifier(
                {key: 'multiplier', propertyKey: 'stats/hp', operation: ModifierConst.OPS.MUL, value: 2, target: owner}
            );
            for(let operation of ItemsConst.GROWTH.NOT_SCALABLE_OPERATIONS){
                sword.modifiers['operation'+operation] = new Modifier(
                    {key: 'operation'+operation, propertyKey: 'stats/def', operation, value: 3, target: owner}
                );
            }
            leveler.initializeItem(sword, 3);
            assert.strictEqual(sword.modifiers.attack.value, 20);
            assert.strictEqual(sword.modifiers.multiplier.value, 4);
            assert.strictEqual(sword.modifiers['operation'+ModifierConst.OPS.SET].value, 3);
            assert.strictEqual(sword.modifiers['operation'+ModifierConst.OPS.METHOD].value, 3);
            assert.strictEqual(sword.modifiers['operation'+ModifierConst.OPS.SET_N].value, 3);
        });

        it('should keep the decimals of the decimal modifiers values on every level', () => {
            let sword = TestHelpers.createGrowingSword(manager);
            sword.modifiers.multiplier = new Modifier({
                key: 'multiplier',
                propertyKey: 'stats/hp',
                operation: ModifierConst.OPS.MUL,
                value: 1.5,
                target: manager.owner
            });
            leveler.initializeItem(sword);
            assert.strictEqual(sword.modifiers.multiplier.value, 1.5);
            leveler.initializeItem(sword, 2);
            assert.strictEqual(sword.modifiers.multiplier.value, 2.25);
            assert.strictEqual(sword.modifiers.attack.value, 15);
        });
    });

    describe('addItemExperience', () => {
        it('should add the experience share to an equipped item without a level up', async () => {
            let sword = TestHelpers.createGrowingSword(manager);
            leveler.initializeItem(sword);
            await sword.equip();
            firedEvents.splice(0);
            assert.strictEqual(await leveler.addItemExperience(sword, 4), true);
            assert.strictEqual(sword.growthExperience, 2);
            assert.strictEqual(sword.growthLevel, 1);
            assert.deepStrictEqual(firedEvents, [{eventName: ItemsEvents.GROWTH_EXPERIENCE_ADDED, args: [sword, 2]}]);
            assert.strictEqual(manager.owner.stats.atk, 20);
        });

        it('should level up an equipped item: unequip, scale, notify, update and equip it again', async () => {
            let sword = TestHelpers.createGrowingSword(manager);
            leveler.initializeItem(sword, 1, 4);
            await sword.equip();
            firedEvents.splice(0);
            let levelUpStates = [];
            manager.listenEvent(ItemsEvents.GROWTH_LEVEL_UP, (item) => {
                item.levelUpNote = 'level '+item.growthLevel;
                levelUpStates.push({
                    growthLevel: item.growthLevel,
                    equipped: item.equipped,
                    attackValue: item.modifiers.attack.value,
                    ownerAttack: manager.owner.stats.atk
                });
            }, 'levelUpState');
            let updatedNotes = [];
            manager.listenEvent(ItemsEvents.UPDATE_ITEM, (item) => updatedNotes.push(item.levelUpNote), 'updateState');
            assert.strictEqual(await leveler.addItemExperience(sword, 10), true);
            assert.deepStrictEqual(firedEvents.map(firedEvent => firedEvent.eventName), recordedEvents);
            assert.deepStrictEqual(levelUpStates, [{growthLevel: 2, equipped: false, attackValue: 15, ownerAttack: 10}]);
            assert.deepStrictEqual(updatedNotes, ['level 2']);
            assert.deepStrictEqual([...firedEvents].pop().args, [sword, 5]);
            assert.strictEqual(sword.growthLevel, 2);
            assert.strictEqual(sword.growthExperience, 9);
            assert.strictEqual(sword.equipped, true);
            assert.strictEqual(manager.owner.stats.atk, 25);
        });

        it('should jump to the highest reached level with a single level up', async () => {
            let sword = TestHelpers.createGrowingSword(manager);
            leveler.initializeItem(sword);
            await sword.equip();
            firedEvents.splice(0);
            assert.strictEqual(await leveler.addItemExperience(sword, growth.levels['3'] * 2), true);
            assert.strictEqual(sword.growthLevel, 3);
            assert.strictEqual(sword.growthExperience, growth.levels['3']);
            let levelUps = firedEvents.filter(firedEvent => ItemsEvents.GROWTH_LEVEL_UP === firedEvent.eventName);
            assert.strictEqual(levelUps.length, 1);
            assert.strictEqual(sword.modifiers.attack.value, 20);
            assert.strictEqual(manager.owner.stats.atk, 30);
        });

        it('should keep the last level and add the experience after the last level', async () => {
            let sword = TestHelpers.createGrowingSword(manager);
            leveler.initializeItem(sword, 5, growth.levels['5']);
            await sword.equip();
            firedEvents.splice(0);
            assert.strictEqual(await leveler.addItemExperience(sword, 100), true);
            assert.strictEqual(sword.growthLevel, 5);
            assert.strictEqual(sword.growthExperience, growth.levels['5'] + 50);
            assert.deepStrictEqual(firedEvents.map(firedEvent => firedEvent.eventName), [
                ItemsEvents.GROWTH_EXPERIENCE_ADDED
            ]);
            assert.strictEqual(sword.modifiers.attack.value, 30);
        });

        it('should not grow an unequipped item that requires the equipment', async () => {
            let sword = TestHelpers.createGrowingSword(manager);
            leveler.initializeItem(sword);
            assert.strictEqual(await leveler.addItemExperience(sword, 100), false);
            assert.strictEqual(sword.growthExperience, 0);
            assert.strictEqual(sword.growthLevel, 1);
            assert.deepStrictEqual(firedEvents, []);
        });

        it('should level up an unequipped item that does not require the equipment without equipping it', async () => {
            let sword = TestHelpers.createGrowingSword(manager, {customData: notRequiredEquipmentCustomData});
            leveler.initializeItem(sword);
            assert.strictEqual(await leveler.addItemExperience(sword, 10), true);
            assert.strictEqual(sword.growthLevel, 2);
            assert.strictEqual(sword.equipped, false);
            assert.deepStrictEqual(firedEvents.map(firedEvent => firedEvent.eventName), levelUpWithoutEquipmentEvents);
            assert.strictEqual(sword.modifiers.attack.value, 15);
            assert.strictEqual(manager.owner.stats.atk, 10);
        });

        it('should level up a growing item that can not be equipped', async () => {
            let growingStone = new ItemBase(
                {...BaseItemsFixtures.basicItem, manager, customData: notRequiredEquipmentCustomData}
            );
            leveler.initializeItem(growingStone);
            assert.strictEqual(await leveler.addItemExperience(growingStone, 10), true);
            assert.strictEqual(growingStone.growthLevel, 2);
            assert.deepStrictEqual(firedEvents.map(firedEvent => firedEvent.eventName), levelUpWithoutEquipmentEvents);
        });

        it('should not grow with a zero, negative or invalid experience', async () => {
            let sword = TestHelpers.createGrowingSword(manager);
            leveler.initializeItem(sword);
            await sword.equip();
            firedEvents.splice(0);
            for(let invalidExperience of [0, 1, -10, 'many', null]){
                assert.strictEqual(await leveler.addItemExperience(sword, invalidExperience), false);
            }
            assert.strictEqual(sword.growthExperience, 0);
            assert.deepStrictEqual(firedEvents, []);
        });

        it('should add every experience of the calls running at the same time', async () => {
            let sword = TestHelpers.createGrowingSword(manager);
            leveler.initializeItem(sword);
            await sword.equip();
            firedEvents.splice(0);
            let results = await Promise.all([leveler.addItemExperience(sword, 4), leveler.addItemExperience(sword, 4)]);
            assert.deepStrictEqual(results, [true, true]);
            assert.strictEqual(sword.growthExperience, 4);
            assert.strictEqual(sword.growthLevel, 1);
            assert.strictEqual(firedEvents.length, 2);
        });

        it('should add the experience received during a level up after the level up is done', async () => {
            let sword = TestHelpers.createGrowingSword(manager);
            leveler.initializeItem(sword, 1, 4);
            await sword.equip();
            firedEvents.splice(0);
            let results = await Promise.all([leveler.addItemExperience(sword, 10), leveler.addItemExperience(sword, 10)]);
            assert.deepStrictEqual(results, [true, true]);
            assert.deepStrictEqual(
                firedEvents.map(firedEvent => firedEvent.eventName),
                [...recordedEvents, ItemsEvents.GROWTH_EXPERIENCE_ADDED]
            );
            assert.strictEqual(sword.growthLevel, 2);
            assert.strictEqual(sword.growthExperience, 14);
            assert.strictEqual(sword.equipped, true);
            assert.strictEqual(manager.owner.stats.atk, 25);
        });

        it('should not equip the item again when it was equipped during the level up', async () => {
            let sword = await TestHelpers.createEquippedGrowingSword(manager, leveler, 1, 4);
            firedEvents.splice(0);
            manager.listenEvent(ItemsEvents.GROWTH_LEVEL_UP, async (item) => await item.equip(), 'equipDuringLevelUp');
            assert.strictEqual(await leveler.addItemExperience(sword, 10), true);
            assert.strictEqual(sword.growthLevel, 2);
            assert.strictEqual(sword.equipped, true);
            assert.strictEqual(manager.owner.stats.atk, 25);
            let equipEvents = firedEvents.filter(firedEvent => ItemsEvents.EQUIP_ITEM === firedEvent.eventName);
            assert.strictEqual(equipEvents.length, 1);
        });

        it('should keep the pending level up on the item until it is done', async () => {
            let sword = await TestHelpers.createEquippedGrowingSword(manager, leveler, 1, 4);
            let equippedStates = [];
            manager.listenEvent(ItemsEvents.GROWTH_LEVEL_UP, (item) => equippedStates.push(item.equipped), 'levelUpState');
            let levelUp = leveler.addItemExperience(sword, 10);
            await sword.pendingGrowth;
            equippedStates.push(sword.equipped);
            assert.strictEqual(await levelUp, true);
            assert.deepStrictEqual(equippedStates, [false, true]);
            assert.strictEqual(manager.owner.stats.atk, 25);
        });

        it('should not grow the items without growth', async () => {
            let basicItem = new ItemBase({...BaseItemsFixtures.basicItem, manager});
            assert.strictEqual(await leveler.addItemExperience(basicItem, 10), false);
            assert.strictEqual(await leveler.addItemExperience(null, 10), false);
            assert.strictEqual(sc.hasOwn(basicItem, 'growthExperience'), false);
            assert.strictEqual(sc.hasOwn(basicItem, 'pendingGrowth'), false);
            assert.deepStrictEqual(firedEvents, []);
        });

        for(let levelUpFailure of levelUpFailures){
            it('should keep the reached level when a level up step fails: '+levelUpFailure.stepName, async () => {
                let sword = await TestHelpers.createEquippedGrowingSword(manager, leveler, 1, 4);
                firedEvents.splice(0);
                let listenerError = TestHelpers.listenFailure(manager, levelUpFailure.failedEvent);
                assert.strictEqual(await leveler.addItemExperience(sword, 10), true);
                assert.deepStrictEqual(firedEvents.map(firedEvent => firedEvent.eventName), recordedEvents);
                assert.strictEqual(sword.growthLevel, 2);
                assert.strictEqual(sword.growthExperience, 9);
                assert.strictEqual(sword.modifiers.attack.value, 15);
                assert.strictEqual(sword.equipped, true);
                assert.strictEqual(manager.owner.stats.atk, levelUpFailure.ownerAttack);
                assert.strictEqual(manager.lastError.code, ItemsConst.ERROR_CODES.GROWTH.STEP_FAILED);
                assert.deepStrictEqual(
                    manager.lastError.data,
                    {itemUid: sword.getInventoryId(), stepName: levelUpFailure.stepName}
                );
                assert.strictEqual(manager.lastError.withError, listenerError);
            });
        }

        it('should stop the level up when the unequip fails and keep the level and modifiers values', async () => {
            let sword = await TestHelpers.createEquippedGrowingSword(manager, leveler, 1, 4);
            firedEvents.splice(0);
            let listenerError = TestHelpers.listenFailure(manager, ItemsEvents.UNEQUIP_ITEM);
            assert.strictEqual(await leveler.addItemExperience(sword, 10), true);
            assert.deepStrictEqual(firedEvents.map(firedEvent => firedEvent.eventName), [
                ItemsEvents.UNEQUIP_ITEM,
                ItemsEvents.GROWTH_EXPERIENCE_ADDED
            ]);
            assert.strictEqual(sword.growthLevel, 1);
            assert.strictEqual(sword.growthExperience, 9);
            assert.strictEqual(sword.modifiers.attack.value, 10);
            assert.strictEqual(sword.equipped, false);
            assert.strictEqual(manager.owner.stats.atk, 20);
            assert.deepStrictEqual(manager.lastError.data, {itemUid: sword.getInventoryId(), stepName: 'unequip'});
            assert.strictEqual(manager.lastError.withError, listenerError);
        });

        it('should keep the added experience when an experience added listener fails', async () => {
            let sword = await TestHelpers.createEquippedGrowingSword(manager, leveler);
            firedEvents.splice(0);
            let listenerError = TestHelpers.listenFailure(manager, ItemsEvents.GROWTH_EXPERIENCE_ADDED);
            assert.strictEqual(await leveler.addItemExperience(sword, 4), true);
            assert.strictEqual(await leveler.addItemExperience(sword, 4), true);
            assert.strictEqual(sword.growthExperience, 4);
            assert.strictEqual(firedEvents.length, 2);
            assert.deepStrictEqual(
                manager.lastError.data,
                {itemUid: sword.getInventoryId(), stepName: ItemsEvents.GROWTH_EXPERIENCE_ADDED}
            );
            assert.strictEqual(manager.lastError.withError, listenerError);
        });
    });

    describe('addOwnerExperience', () => {
        it('should grow only the growing items that can receive the experience', async () => {
            let equippedSword = TestHelpers.createGrowingSword(manager, {uid: 'equipped-sword'});
            let unequippedSword = TestHelpers.createGrowingSword(manager, {uid: 'unequipped-sword'});
            let basicItem = new ItemBase({...BaseItemsFixtures.basicItem, manager, uid: 'basic-item'});
            await manager.setItems({equippedSword, unequippedSword, basicItem});
            await equippedSword.equip();
            assert.strictEqual(await leveler.addOwnerExperience(manager, 10), 1);
            assert.strictEqual(equippedSword.growthLevel, 2);
            assert.strictEqual(equippedSword.growthExperience, 5);
            assert.strictEqual(sc.hasOwn(unequippedSword, 'growthExperience'), false);
            assert.strictEqual(sc.hasOwn(basicItem, 'growthLevel'), false);
        });

        it('should grow nothing without a manager, without items or without experience', async () => {
            let sword = TestHelpers.createGrowingSword(manager);
            await manager.setItems({sword});
            await sword.equip();
            assert.strictEqual(await leveler.addOwnerExperience(null, 10), 0);
            assert.strictEqual(await leveler.addOwnerExperience({}, 10), 0);
            assert.strictEqual(await leveler.addOwnerExperience({items: {}}, 10), 0);
            assert.strictEqual(await leveler.addOwnerExperience(manager, 0), 0);
            assert.strictEqual(sc.hasOwn(sword, 'growthExperience'), false);
        });
    });

    describe('fetchGrowableItems', () => {
        it('should return only the items with a growth custom data', async () => {
            let sword = TestHelpers.createGrowingSword(manager);
            let basicItem = new ItemBase({...BaseItemsFixtures.basicItem, manager});
            await manager.setItems({sword, basicItem});
            assert.deepStrictEqual(leveler.fetchGrowableItems(manager), [sword]);
            assert.deepStrictEqual(leveler.fetchGrowableItems({items: {basicItem}}), []);
            assert.deepStrictEqual(leveler.fetchGrowableItems(null), []);
        });
    });
});
