/**
 *
 * Reldens - Items System - DataServerValidator
 *
 */

const { Logger, sc } = require('@reldens/utils');

class DataServerValidator
{

    static getValidDataServer(props)
    {
        let dataServer = sc.get(props, 'dataServer', false);
        if(false === dataServer){
            Logger.critical('Data Server instance not found.');
            return false;
        }
        if('function' !== typeof dataServer.connect || 'function' !== typeof dataServer.generateEntities){
            Logger.critical('Data Server property found but the instance required methods are not available.');
            return false;
        }
        return dataServer;
    }

}

module.exports.DataServerValidator = DataServerValidator;
