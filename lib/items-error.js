/**
 *
 * Reldens - Items System - ItemsError
 *
 */

class ItemsError
{

    constructor(message = '', code = '', data = {}, withError = false)
    {
        this.message = message;
        this.code = code;
        this.data = data;
        this.withError = withError;
    }

}

module.exports = ItemsError;
