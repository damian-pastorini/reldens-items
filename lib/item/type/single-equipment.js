const ItemEquipment = require('./equipment');

class SingleEquipment extends ItemEquipment
{

    constructor(props)
    {
        super(props);
        this.singleInstance = true;
    }

}

module.exports = SingleEquipment;
