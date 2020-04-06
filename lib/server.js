/**
 *
 * Reldens - Items Manager - Server Package
 *
 */

const ItemsManager = require('./manager');
const { StorageObserver } = require('./server/storage-observer');
const Sender = require('./server/sender');
const { Logger, ErrorManager } = require('@reldens/utils');

class ItemsServer
{

    constructor(props)
    {
        if(!{}.hasOwnProperty.call(props, 'owner')){
            ErrorManager.error('Undefined owner.');
        }
        this.manager = new ItemsManager(props);
        // check if the storage was activated:
        if({}.hasOwnProperty.call(props, 'persistence')){
            let modelsManager = false;
            if({}.hasOwnProperty.call(props, 'modelsManager')){
                modelsManager = props.modelsManager;
            }
            // check if the owner has the required persisData methods in the case the storage is active:
            if(!{}.hasOwnProperty.call(props.owner, 'persistData') || typeof props.owner.persistData !== 'function'){
                Logger.error('Required method "persistData" not found in ItemServer props.owner.');
            }
            this.dataServer = new StorageObserver(this.manager, modelsManager);
            this.dataServer.listenEvents();
        }
        if({}.hasOwnProperty.call(props, 'client')){
            // @NOTE: client must implement the sent method with will be used to send the current action parameters.
            if(!{}.hasOwnProperty.call(props.client, 'send') || typeof props.client.send !== 'function'){
                Logger.error('Required method "send" not found in ItemServer props.client.');
            } else {
                if({}.hasOwnProperty.call(props.client, 'broadcast') && typeof props.client.broadcast !== 'function'){
                    Logger.error('Property "broadcast" found in ItemServer props.client but is not a function.');
                }
                this.client = new Sender(this.manager, props.client);
            }
        }
    }

}

module.exports = ItemsServer;
