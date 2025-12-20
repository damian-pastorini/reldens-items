/**
 *
 * Reldens - Mock Sender
 *
 */

class MockSender
{

    constructor()
    {
        this.sentMessages = [];
    }

    sendItemData(data)
    {
        this.sentMessages.push({
            type: 'itemData',
            data: data,
            timestamp: Date.now()
        });
    }

    sendItemDataToPlayer(playerId, data)
    {
        this.sentMessages.push({
            type: 'itemDataToPlayer',
            playerId: playerId,
            data: data,
            timestamp: Date.now()
        });
    }

    clearMessages()
    {
        this.sentMessages.length = 0;
    }

    getLastMessage()
    {
        if(0 === this.sentMessages.length){
            return null;
        }
        return this.sentMessages[this.sentMessages.length - 1];
    }

    getMessagesByType(type)
    {
        return this.sentMessages.filter(msg => msg.type === type);
    }

}

module.exports.MockSender = MockSender;
