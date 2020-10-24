/**
 *
 * Reldens - Items System - Server Package
 *
 * This class is just to group the server side features, storage and communications along with the items manager.
 *
 */

const ItemsManager = require('./manager');
const { StorageObserver } = require('./server/storage-observer');
const Sender = require('./server/sender');
const { Logger, ErrorManager, sc } = require('@reldens/utils');

class ItemsServer
{

    constructor(props)
    {
        if(!sc.hasOwn(props, 'owner')){
            ErrorManager.error('Undefined owner.');
        }
        this.manager = new ItemsManager(props);
        // check if the storage was activated:
        if(sc.hasOwn(props, 'persistence') && props.persistence){
            let modelsManager = false;
            if(sc.hasOwn(props, 'modelsManager')){
                modelsManager = props.modelsManager;
            }
            // check if the owner has the required persisData methods in the case the storage is active:
            if(!sc.hasOwn(props.owner, 'persistData') || typeof props.owner.persistData !== 'function'){
                Logger.error('Required method "persistData" not found in ItemServer props.owner.');
            }
            this.dataServer = new StorageObserver(this.manager, modelsManager);
            this.dataServer.listenEvents();
        }
        if(sc.hasOwn(props, 'client')){
            this.client = new Sender({manager: this.manager, client: props.client});
        }
    }

}

module.exports = ItemsServer;
