
const { Item } = require('./item');

class Usable extends Item
{

    constructor(props)
    {
        super(props);
    }

    async activateItem(target = false)
    {
        if(!target){
            target = this.manager.owner;
        }
        return await this.manager.events.emit('reldens.activateItem', this, target);
    }

}

module.exports.Usable = Usable;
