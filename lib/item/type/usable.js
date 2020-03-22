
const { Item } = require('./item');

class Usable extends Item
{

    constructor(props)
    {
        super(props);
        this.uses = {}.hasOwnProperty.call(props, 'uses') ? props.uses : 1;
    }

    async executeItem(target = false)
    {
        if(!target){
            target = this.manager.owner;
        }
        await this.applyModifiers();
        // @TODO: for now we will only let use one item per time.
        this.uses--;
        return await this.manager.events.emit('reldens.executeItem', this, target);
    }

}

module.exports.Usable = Usable;
