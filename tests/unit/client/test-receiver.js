/**
 *
 * Reldens - Receiver Unit Tests
 *
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const Receiver = require('../../../lib/client/receiver');
const ItemsServer = require('../../../lib/server');
const ItemGrowthLeveler = require('../../../lib/item/growth/item-growth-leveler');
const Equipment = require('../../../lib/item/type/equipment');
const ItemsConst = require('../../../lib/constants');
const ItemsEvents = require('../../../lib/items-events');
const { TestHelpers } = require('../../utils/test-helpers');
const { EquipmentItemsFixtures } = require('../../fixtures/items/equipment-items');
const { MockOwner } = require('../../fixtures/mocks/mock-owner');
const { EventsManager, sc } = require('@reldens/utils');

describe('Receiver', () => {
    let owner;
    let receiver;
    let clientEvents;

    beforeEach(() => {
        owner = new MockOwner();
        receiver = new Receiver({owner, eventsManager: new EventsManager()});
        clientEvents = TestHelpers.recordEvents(receiver.manager, [ItemsEvents.UPDATE_ITEM]);
    });

    describe('update item', () => {
        it('should handle the update action by default and skip it when the defaults are avoided', () => {
            assert.strictEqual(receiver.actions[ItemsConst.ACTION_UPDATE], 'onUpdateItem');
            let customReceiver = new Receiver({owner, avoidDefaults: true, eventsManager: new EventsManager()});
            assert.strictEqual(sc.hasOwn(customReceiver.actions, ItemsConst.ACTION_UPDATE), false);
        });

        it('should update the existent item, spread its custom data and fire the item update', async () => {
            let clientSword = new Equipment(
                {...EquipmentItemsFixtures.growingSword, manager: receiver.manager, uid: 'sword-uid'}
            );
            await receiver.manager.setItems({'sword-uid': clientSword});
            let message = {
                act: ItemsConst.ACTION_UPDATE,
                owner: owner.id,
                item: {
                    'idx': 'sword-uid',
                    id: clientSword.id,
                    key: clientSword.key,
                    growthLevel: 2,
                    growthExperience: 9,
                    customData: {modifiersDisplay: ['+15 atk'], growthLevel: 2}
                }
            };
            assert.strictEqual(await receiver.onUpdateItem(message), true);
            assert.strictEqual(clientSword.growthLevel, 2);
            assert.strictEqual(clientSword.growthExperience, 9);
            assert.deepStrictEqual(clientSword.modifiersDisplay, ['+15 atk']);
            assert.strictEqual(clientSword.getInventoryId(), 'sword-uid');
            assert.deepStrictEqual(clientEvents, [{eventName: ItemsEvents.UPDATE_ITEM, args: [clientSword]}]);
            assert.deepStrictEqual(receiver.recieveErrorsLog, []);
        });

        it('should log the update of a missing item without firing the item update', async () => {
            let message = {act: ItemsConst.ACTION_UPDATE, owner: owner.id, item: {'idx': 'missing-uid', growthLevel: 2}};
            assert.strictEqual(await receiver.onUpdateItem(message), false);
            assert.deepStrictEqual(receiver.recieveErrorsLog, [
                {'Error receiver onUpdateItem.': 'Item not found: missing-uid'}
            ]);
            assert.deepStrictEqual(clientEvents, []);
        });

        it('should log the update message without item data without firing the item update', async () => {
            assert.strictEqual(await receiver.onUpdateItem({act: ItemsConst.ACTION_UPDATE, owner: owner.id}), false);
            assert.strictEqual(await receiver.onUpdateItem({act: ItemsConst.ACTION_UPDATE, item: null}), false);
            assert.deepStrictEqual(receiver.recieveErrorsLog, [
                {'Error receiver onUpdateItem.': 'Item not found: '},
                {'Error receiver onUpdateItem.': 'Item not found: '}
            ]);
            assert.deepStrictEqual(clientEvents, []);
        });

        it('should keep the updated item and log the error of a failed item update listener', async () => {
            let clientSword = new Equipment(
                {...EquipmentItemsFixtures.growingSword, manager: receiver.manager, uid: 'sword-uid'}
            );
            await receiver.manager.setItems({'sword-uid': clientSword});
            let listenerError = TestHelpers.listenFailure(receiver.manager, ItemsEvents.UPDATE_ITEM);
            let message = {act: ItemsConst.ACTION_UPDATE, owner: owner.id, item: {'idx': 'sword-uid', growthLevel: 2}};
            assert.strictEqual(await receiver.processMessage(message), false);
            assert.strictEqual(clientSword.growthLevel, 2);
            assert.deepStrictEqual(clientEvents, [{eventName: ItemsEvents.UPDATE_ITEM, args: [clientSword]}]);
            assert.deepStrictEqual(receiver.recieveErrorsLog, [{'Error receiver onUpdateItem.': listenerError}]);
        });

        it('should replicate a server item level up with the sender messages', async () => {
            let messagesClient = TestHelpers.createMessagesClient();
            let itemsServer = new ItemsServer({owner, client: messagesClient, eventsManager: new EventsManager()});
            let serverSword = TestHelpers.createGrowingSword(itemsServer.manager);
            let leveler = new ItemGrowthLeveler();
            leveler.initializeItem(serverSword, 1, 4);
            await itemsServer.manager.setItems({[serverSword.getInventoryId()]: serverSword});
            await serverSword.equip();
            assert.strictEqual(await leveler.addItemExperience(serverSword, 10), true);
            assert.deepStrictEqual(messagesClient.sentMessages.map(message => message.act), [
                ItemsConst.ACTION_SET_ITEMS,
                ItemsConst.ACTION_EQUIP,
                ItemsConst.ACTION_MOD_APPLIED,
                ItemsConst.ACTION_UNEQUIP,
                ItemsConst.ACTION_MOD_REVERTED,
                ItemsConst.ACTION_UPDATE,
                ItemsConst.ACTION_EQUIP,
                ItemsConst.ACTION_MOD_APPLIED
            ]);
            for(let message of messagesClient.sentMessages){
                await receiver.processMessage(message);
            }
            let clientSword = receiver.manager.items[serverSword.getInventoryId()];
            assert.strictEqual(clientSword.growthLevel, serverSword.growthLevel);
            assert.strictEqual(clientSword.growthExperience, serverSword.growthExperience);
            assert.strictEqual(clientSword.equipped, true);
            assert.deepStrictEqual(clientEvents, [{eventName: ItemsEvents.UPDATE_ITEM, args: [clientSword]}]);
            assert.deepStrictEqual(receiver.recieveErrorsLog, []);
        });
    });

    describe('remove item', () => {
        let replicateEquippedItemRemoval = async (unequipOnRemove) => {
            let messagesClient = TestHelpers.createMessagesClient();
            let itemsServer = new ItemsServer(
                {owner, client: messagesClient, eventsManager: new EventsManager(), unequipOnRemove}
            );
            let serverSword = TestHelpers.createGrowingSword(itemsServer.manager);
            await itemsServer.manager.setItems({[serverSword.getInventoryId()]: serverSword});
            await serverSword.equip();
            await itemsServer.manager.removeItem(serverSword.getInventoryId());
            let clientUnequips = TestHelpers.recordEvents(receiver.manager, [ItemsEvents.UNEQUIP_ITEM]);
            for(let message of messagesClient.sentMessages){
                await receiver.processMessage(message);
            }
            return [
                messagesClient.sentMessages.map(message => message.act),
                clientUnequips.length,
                Object.keys(receiver.manager.items).length,
                receiver.recieveErrorsLog
            ];
        };

        it('should create its own manager with the unequip on remove off and keep a given manager as it is', () => {
            let givenManager = new ItemsServer({owner, eventsManager: new EventsManager()}).manager;
            assert.deepStrictEqual(
                [
                    receiver.manager.unequipOnRemove,
                    new Receiver({owner, manager: givenManager}).manager === givenManager,
                    givenManager.unequipOnRemove
                ],
                [false, true, true]
            );
        });

        it('should replicate the server unequip and removal of an equipped item', async () => {
            assert.deepStrictEqual(await replicateEquippedItemRemoval(true), [
                [
                    ItemsConst.ACTION_SET_ITEMS,
                    ItemsConst.ACTION_EQUIP,
                    ItemsConst.ACTION_MOD_APPLIED,
                    ItemsConst.ACTION_UNEQUIP,
                    ItemsConst.ACTION_MOD_REVERTED,
                    ItemsConst.ACTION_REMOVE
                ],
                1,
                0,
                []
            ]);
        });

        it('should remove an equipped item without its own unequip when the server does not unequip it', async () => {
            assert.deepStrictEqual(await replicateEquippedItemRemoval(false), [
                [ItemsConst.ACTION_SET_ITEMS, ItemsConst.ACTION_EQUIP, ItemsConst.ACTION_MOD_APPLIED, ItemsConst.ACTION_REMOVE],
                0,
                0,
                []
            ]);
        });
    });

    describe('process message', () => {
        let clientSword;

        beforeEach(async () => {
            clientSword = new Equipment(
                {...EquipmentItemsFixtures.growingSword, manager: receiver.manager, uid: 'sword-uid', qty: 1}
            );
            await receiver.manager.setItems({'sword-uid': clientSword});
        });

        it('should skip the messages without the items action prefix or with an unknown action', async () => {
            assert.strictEqual(await receiver.processMessage({act: 'other-action'}), false);
            assert.strictEqual(await receiver.processMessage({}), false);
            assert.strictEqual(await receiver.processMessage({act: ItemsConst.ACTIONS_PREF+'unknown'}), false);
            receiver.actions[ItemsConst.ACTIONS_PREF+'missing'] = 'onMissingMethod';
            assert.strictEqual(await receiver.processMessage({act: ItemsConst.ACTIONS_PREF+'missing'}), false);
            assert.deepStrictEqual(receiver.recieveErrorsLog, []);
        });

        it('should return the result of every replicated action', async () => {
            let addMessage = {
                act: ItemsConst.ACTION_ADD,
                item: {...EquipmentItemsFixtures.basicSword, 'idx': 'basic-sword-uid', qty: 1}
            };
            let addedItem = await receiver.processMessage(addMessage);
            assert.strictEqual(addedItem, receiver.manager.items['basic-sword-uid']);
            assert.strictEqual(addedItem.getInventoryId(), 'basic-sword-uid');
            let setQtyMessage = {act: ItemsConst.ACTION_MODIFY_QTY, item: {'idx': 'sword-uid', qty: 3}};
            assert.strictEqual(await receiver.processMessage(setQtyMessage), true);
            assert.strictEqual(clientSword.qty, 3);
            let equipMessage = {act: ItemsConst.ACTION_EQUIP, item: {'idx': 'sword-uid'}};
            assert.strictEqual(await receiver.processMessage(equipMessage), true);
            assert.strictEqual(clientSword.equipped, true);
            let unequipMessage = {act: ItemsConst.ACTION_UNEQUIP, item: {'idx': 'sword-uid'}};
            assert.strictEqual(await receiver.processMessage(unequipMessage), true);
            assert.strictEqual(clientSword.equipped, false);
            let removeMessage = {act: ItemsConst.ACTION_REMOVE, item: {'idx': 'basic-sword-uid'}};
            assert.strictEqual(await receiver.processMessage(removeMessage), true);
            assert.strictEqual(sc.hasOwn(receiver.manager.items, 'basic-sword-uid'), false);
            assert.deepStrictEqual(receiver.recieveErrorsLog, []);
        });

        it('should return the failed result of an action the manager rejects without logging an error', async () => {
            let removeMessage = {act: ItemsConst.ACTION_REMOVE, item: {'idx': 'missing-uid'}};
            assert.strictEqual(await receiver.processMessage(removeMessage), false);
            assert.strictEqual(receiver.manager.lastError.code, ItemsConst.ERROR_CODES.KEY_NOT_FOUND);
            assert.deepStrictEqual(receiver.recieveErrorsLog, []);
        });

        it('should log the error of every failed action under its method name and keep processing', async () => {
            let failedActions = [
                {
                    eventName: ItemsEvents.ADD_ITEM,
                    message: {
                        act: ItemsConst.ACTION_ADD,
                        item: {...EquipmentItemsFixtures.basicSword, 'idx': 'basic-sword-uid', qty: 1}
                    },
                    method: 'onAddItem'
                },
                {
                    eventName: ItemsEvents.MODIFY_ITEM_QTY,
                    message: {act: ItemsConst.ACTION_MODIFY_QTY, item: {'idx': 'sword-uid', qty: 2}},
                    method: 'onSetQty'
                },
                {
                    eventName: ItemsEvents.EQUIP_ITEM,
                    message: {act: ItemsConst.ACTION_EQUIP, item: {'idx': 'sword-uid'}},
                    method: 'onEquipItem'
                },
                {
                    eventName: ItemsEvents.UNEQUIP_ITEM,
                    message: {act: ItemsConst.ACTION_UNEQUIP, item: {'idx': 'sword-uid'}},
                    method: 'onUnequipItem'
                },
                {
                    eventName: ItemsEvents.REMOVE_ITEM,
                    message: {act: ItemsConst.ACTION_REMOVE, item: {'idx': 'sword-uid'}},
                    method: 'onRemoveItem'
                },
                {
                    eventName: ItemsEvents.SET_ITEMS,
                    message: {act: ItemsConst.ACTION_SET_ITEMS, items: {}},
                    method: 'onSetItems'
                },
                {
                    eventName: ItemsEvents.SET_GROUPS,
                    message: {act: ItemsConst.ACTION_SET_GROUPS, groups: {}},
                    method: 'onSetGroups'
                }
            ];
            let expectedErrorsLog = [];
            for(let failedAction of failedActions){
                let listenerError = TestHelpers.listenFailure(receiver.manager, failedAction.eventName);
                assert.strictEqual(await receiver.processMessage(failedAction.message), false);
                expectedErrorsLog.push({['Error receiver '+failedAction.method+'.']: listenerError});
            }
            assert.deepStrictEqual(receiver.recieveErrorsLog, expectedErrorsLog);
            assert.strictEqual(clientSword.qty, 2);
            assert.strictEqual(clientSword.equipped, false);
        });

        it('should log the equip and unequip of a missing item instead of throwing', async () => {
            let equipMessage = {act: ItemsConst.ACTION_EQUIP, item: {'idx': 'missing-uid'}};
            assert.strictEqual(await receiver.processMessage(equipMessage), false);
            let unequipMessage = {act: ItemsConst.ACTION_UNEQUIP, item: {'idx': 'missing-uid'}};
            assert.strictEqual(await receiver.processMessage(unequipMessage), false);
            assert.deepStrictEqual(receiver.recieveErrorsLog.map(loggedError => Object.keys(loggedError)[0]), [
                'Error receiver onEquipItem.',
                'Error receiver onUnequipItem.'
            ]);
            assert.ok(receiver.recieveErrorsLog[0]['Error receiver onEquipItem.'] instanceof TypeError);
            assert.ok(receiver.recieveErrorsLog[1]['Error receiver onUnequipItem.'] instanceof TypeError);
        });
    });
});
