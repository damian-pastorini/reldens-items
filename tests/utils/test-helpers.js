/**
 *
 * Reldens - Test Helpers
 *
 */

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

    static clearEventListeners()
    {
        EventsManagerSingleton.removeAllListeners();
    }

    static generateUniqueId(prefix = 'test')
    {
        return prefix+'-'+Date.now()+'-'+Math.random().toString(36).substring(2, 9);
    }

}

module.exports.TestHelpers = TestHelpers;
