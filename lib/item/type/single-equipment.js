const { ItemEquipment } = require('@reldens/items-system');

class SingleEquipment extends ItemEquipment
{

    constructor(props)
    {
        super(props);
        this.singleInstance = true;
    }

}

module.exports = SingleEquipment;
