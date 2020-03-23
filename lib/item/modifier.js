
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
    }

}

module.exports = Modifier;
