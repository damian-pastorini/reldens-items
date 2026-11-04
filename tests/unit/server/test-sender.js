/**
 *
 * Reldens - Sender Unit Tests
 *
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const ItemsServer = require('../../../lib/server');
const ItemsManager = require('../../../lib/manager');
const ItemBase = require('../../../lib/item/type/item-base');
const ItemsConst = require('../../../lib/constants');
const ItemsEvents = require('../../../lib/items-events');
const { TestHelpers } = require('../../utils/test-helpers');
const { BaseItemsFixtures } = require('../../fixtures/items/base-items');
const { MockOwner } = require('../../fixtures/mocks/mock-owner');
const { EventsManager } = require('@reldens/utils');

describe('Sender', () => {
    let owner;
    let messagesClient;
    let itemsServer;

    beforeEach(() => {
        owner = new MockOwner();
        messagesClient = TestHelpers.createMessagesClient();
        itemsServer = new ItemsServer({owner, client: messagesClient, eventsManager: new EventsManager()});
    });

    describe('update item', () => {
        it('should send the item id, key, growth level and growth experience by default', () => {
            assert.deepStrictEqual(itemsServer.client.sendProperties[ItemsConst.ACTION_UPDATE], {
                behavior: ItemsConst.BEHAVIOR_SEND,
                send: ['id', 'key', 'growthLevel', 'growthExperience']
            });
        });

        it('should send the update action when the item update event is fired', async () => {
            let sword = TestHelpers.createGrowingSword(itemsServer.manager);
            sword.growthLevel = 2;
            sword.growthExperience = 9;
            await itemsServer.manager.fireEvent(ItemsEvents.UPDATE_ITEM, sword);
            assert.deepStrictEqual(messagesClient.sentMessages, [{
                act: ItemsConst.ACTION_UPDATE,
                owner: owner.id,
                item: {
                    idx: sword.getInventoryId(),
                    id: sword.id,
                    key: sword.key,
                    growthLevel: 2,
                    growthExperience: 9
                },
                targetProps: {}
            }]);
        });

        it('should send the properties added to the update action', async () => {
            itemsServer.client.sendProperties[ItemsConst.ACTION_UPDATE].send.push('customData');
            let sword = TestHelpers.createGrowingSword(itemsServer.manager);
            sword.growthLevel = 2;
            sword.growthExperience = 9;
            sword.customData = {modifiersDisplay: ['+15 atk'], growthLevel: 2};
            await itemsServer.client.sendUpdateItemData(sword);
            assert.deepStrictEqual(
                [...messagesClient.sentMessages].pop().item.customData,
                {modifiersDisplay: ['+15 atk'], growthLevel: 2}
            );
        });

        it('should send only the existent properties of an item that does not grow', async () => {
            let basicItem = new ItemBase({...BaseItemsFixtures.basicItem, manager: itemsServer.manager});
            await itemsServer.client.sendUpdateItemData(basicItem);
            assert.deepStrictEqual(
                [...messagesClient.sentMessages].pop().item,
                {idx: basicItem.getInventoryId(), id: basicItem.id, key: basicItem.key}
            );
        });

        it('should reject the update when the client fails to send it', async () => {
            let sendError = new Error('Client send failed.');
            messagesClient.send = async () => {
                throw sendError;
            };
            let sword = TestHelpers.createGrowingSword(itemsServer.manager);
            await assert.rejects(itemsServer.client.sendUpdateItemData(sword), sendError);
            assert.deepStrictEqual(messagesClient.sentMessages, []);
        });

        it('should not send the update without a client able to send it', async () => {
            let clientWithoutBroadcast = {send: async (message) => message};
            let serverWithoutBroadcast = new ItemsServer(
                {owner, client: clientWithoutBroadcast, eventsManager: new EventsManager()}
            );
            let sword = TestHelpers.createGrowingSword(serverWithoutBroadcast.manager);
            assert.strictEqual(await serverWithoutBroadcast.client.sendUpdateItemData(sword), false);
        });

        it('should not send the update of an item from another owner', async () => {
            let otherManager = new ItemsManager({owner: new MockOwner('other-owner'), eventsManager: new EventsManager()});
            let otherSword = TestHelpers.createGrowingSword(otherManager);
            assert.strictEqual(await itemsServer.client.sendUpdateItemData(otherSword), false);
            assert.deepStrictEqual(messagesClient.sentMessages, []);
        });
    });
});
