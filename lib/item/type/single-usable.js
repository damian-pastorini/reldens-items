const ItemUsable = require('./usable');

class SingleUsable extends ItemUsable
{

    constructor(props)
    {
        super(props);
        this.singleInstance = true;
    }

}

module.exports = SingleUsable;
