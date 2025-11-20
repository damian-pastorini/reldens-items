/**
 *
 * Reldens - Items System - Server Package
 *
 * This class is just to group the server side features, storage and communications along with the items manager.
 *
 */

const ItemsManager = require('./manager');
const Sender = require('./server/sender');
const { Logger, sc } = require('@reldens/utils');

class ItemsServer
{

    constructor(props)
    {
        this.hasError = false;
        if(!sc.hasOwn(props, 'owner')){
            Logger.critical('Undefined owner.');
            this.hasError = true;
        }
        this.manager = new ItemsManager(props);
        this.createClient(props);
    }

    createClient(props)
    {
        if(this.hasError){
            return false;
        }
        if(!sc.hasOwn(props, 'client')){
            return false;
        }
        this.client = new Sender({manager: this.manager, client: props.client});
    }

}

module.exports = ItemsServer;
