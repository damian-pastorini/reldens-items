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
        // @TODO - BETA - When moving to ES or TS dataServer will be typed and an interface.
        let dataServer = sc.getDef(props, 'dataServer', false);
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
