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
                    idx: 'sword-uid',
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
            let message = {act: ItemsConst.ACTION_UPDATE, owner: owner.id, item: {idx: 'missing-uid', growthLevel: 2}};
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
            let message = {act: ItemsConst.ACTION_UPDATE, owner: owner.id, item: {idx: 'sword-uid', growthLevel: 2}};
            assert.strictEqual(await receiver.onUpdateItem(message), true);
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
                receiver.processMessage(message);
            }
            let clientSword = receiver.manager.items[serverSword.getInventoryId()];
            assert.strictEqual(clientSword.growthLevel, serverSword.growthLevel);
            assert.strictEqual(clientSword.growthExperience, serverSword.growthExperience);
            assert.strictEqual(clientSword.equipped, true);
            assert.deepStrictEqual(clientEvents, [{eventName: ItemsEvents.UPDATE_ITEM, args: [clientSword]}]);
            assert.deepStrictEqual(receiver.recieveErrorsLog, []);
        });
    });
});
