const { Item } = require('./item');

class Equipment extends Item
{

    constructor(props)
    {
        super(props);
        this.equipped = false;
    }

}

module.exports.Equipment = Equipment;
