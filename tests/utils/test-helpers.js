/**
 *
 * Reldens - Test Helpers
 *
 */

const Equipment = require('../../lib/item/type/equipment');
const { EquipmentItemsFixtures } = require('../fixtures/items/equipment-items');
const { Modifier, ModifierConst } = require('@reldens/modifiers');
const { EventsManagerSingleton } = require('@reldens/utils');

class TestHelpers
{

    static createMockOwner(id = 'test-owner', additionalProps = {})
    {
        return {
            id: id,
            events: EventsManagerSingleton,
            state: {},
            ...additionalProps
        };
    }

    static createMockSender()
    {
        let sentMessages = [];
        return {
            sentMessages: sentMessages,
            sendItemData: (data) => {
                sentMessages.push({type: 'itemData', data: data});
            },
            sendItemDataToPlayer: (playerId, data) => {
                sentMessages.push({type: 'itemDataToPlayer', playerId: playerId, data: data});
            },
            clearMessages: () => {
                sentMessages.length = 0;
            }
        };
    }

    static createMockModel(data)
    {
        return {
            id: data.id || 1,
            item_id: data.item_id || 1,
            key: data.key || 'test-item',
            type: data.type || 10,
            label: data.label || 'Test Item',
            description: data.description || '',
            qty: data.qty || 1,
            ...data
        };
    }

    static createMockModifier(key, operation, value, propertyKey = null)
    {
        return {
            key: key,
            operation: operation,
            value: value,
            propertyKey: propertyKey || key
        };
    }

    static createStepsModifier(steps)
    {
        return {
            apply: () => {
                steps.push('apply');
            },
            revert: () => {
                steps.push('revert');
            }
        };
    }

    static clearEventListeners()
    {
        EventsManagerSingleton.removeAllListeners();
    }

    static createGrowingSword(manager, props = {})
    {
        return new Equipment(Object.assign({}, EquipmentItemsFixtures.growingSword, {
            manager,
            modifiers: {
                attack: new Modifier({
                    key: 'attack',
                    propertyKey: 'stats/atk',
                    operation: ModifierConst.OPS.INC,
                    value: 10,
                    target: manager.owner
                })
            }
        }, props));
    }

    static async createEquippedGrowingSword(manager, leveler, level, experience)
    {
        let sword = TestHelpers.createGrowingSword(manager);
        leveler.initializeItem(sword, level, experience);
        await sword.equip();
        return sword;
    }

    static recordEvents(manager, eventNames)
    {
        let firedEvents = [];
        for(let eventName of eventNames){
            manager.listenEvent(eventName, (...args) => firedEvents.push({eventName, args}), 'record.'+eventName);
        }
        return firedEvents;
    }

    static listenFailure(manager, eventName)
    {
        let listenerError = new Error('Failed listener: '+eventName);
        manager.listenEvent(eventName, () => {
            throw listenerError;
        }, 'failure.'+eventName);
        return listenerError;
    }

    static createMessagesClient()
    {
        let messagesClient = {sentMessages: []};
        messagesClient.send = async (message) => messagesClient.sentMessages.push(message);
        messagesClient.broadcast = async (message) => messagesClient.sentMessages.push(message);
        return messagesClient;
    }

    static generateUniqueId(prefix = 'test')
    {
        return prefix+'-'+Date.now()+'-'+Math.random().toString(36).substring(2, 9);
    }

}

module.exports.TestHelpers = TestHelpers;
