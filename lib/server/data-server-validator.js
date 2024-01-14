/**
 *
 * Reldens - Items System - DataServerValidator
 *
 */

const { ErrorManager, sc } = require('@reldens/utils');

class DataServerValidator
{

    static getValidDataServer(props)
    {
        let dataServer = sc.get(props, 'dataServer', false);
        if(false === dataServer){
            ErrorManager.error('Data Server instance not found.', props);
        }
        if('function' !== typeof dataServer.connect || 'function' !== typeof dataServer.generateEntities){
            ErrorManager.error(
                'Data Server property found but the instance required methods are not available.',
                dataServer
            );
        }
        return dataServer;
    }

}

module.exports.DataServerValidator = DataServerValidator;
