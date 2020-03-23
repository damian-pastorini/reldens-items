/**
 *
 * Reldens - Items Manager - Server Package
 *
 */

const ItemsManager = require('./manager');
const { Observer } = require('./storage/observer');
const { Logger, ErrorManager } = require('@reldens/utils');

class ItemsServer
{

    constructor(props)
    {
        if(!{}.hasOwnProperty.call(props, 'owner')){
            ErrorManager.error('Undefined owner.');
        }
        this.manager = new ItemsManager(props.owner);
        if({}.hasOwnProperty.call(props, 'persistence')){
            let modelsManager = false;
            if({}.hasOwnProperty.call(props, 'modelsManager')){
                modelsManager = props.modelsManager;
            }
            this.dataServer = new Observer(this.manager, modelsManager);
        }
        if({}.hasOwnProperty.call(props, 'client')){
            // @NOTE: client must implement the sent method with will be used to send the current action parameters.
            if(!{}.hasOwnProperty.call(props.client, 'send') || typeof props.send !== 'function'){
                Logger.error('Required method "send" not found in ItemServer props.client.');
            } else if(!{}.hasOwnProperty.call(props.owner, 'persistData') || typeof props.send !== 'function'){
                Logger.error('Required method "persistData" not found in ItemServer props.owner.');
            } else {
                this.client = props.client;
            }
        }
    }

}

module.exports = ItemsServer;
