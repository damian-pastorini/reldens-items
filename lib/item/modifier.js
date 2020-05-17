/**
 *
 * Reldens - Items System - Modifier
 *
 */

const { ErrorManager } = require('@reldens/utils');

class Modifier
{

    constructor(props)
    {
        if(
            !{}.hasOwnProperty.call(props, 'key')
            || !{}.hasOwnProperty.call(props, 'propertyKey')
            || !{}.hasOwnProperty.call(props, 'operation')
            || !{}.hasOwnProperty.call(props, 'value')
        ){
            ErrorManager.error(['Undefined required properties {key, propertyKey, operation, value} in:', props]);
        }
        this.key = props.key;
        this.propertyKey = props.propertyKey;
        this.operation = props.operation;
        this.value = props.value;
        this.itemId = props.itemId || false;
        this.minValue = {}.hasOwnProperty.call(props, 'minValue') ? props.minValue : false;
        this.maxValue = {}.hasOwnProperty.call(props, 'maxValue') ? props.maxValue : false;
        this.minProperty = {}.hasOwnProperty.call(props, 'minProperty') ? props.minProperty : false;
        this.maxProperty = {}.hasOwnProperty.call(props, 'maxProperty') ? props.maxProperty : false;
    }

}

module.exports = Modifier;
