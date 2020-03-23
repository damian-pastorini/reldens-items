
const Item = require('./item');
const ItemsConst = require('../../constants');

class Usable extends Item
{

    constructor(props)
    {
        super(props);
        this.type = ItemsConst.TYPE_USABLE;
        this.uses = {}.hasOwnProperty.call(props, 'uses') ? props.uses : 1;
    }

    async use(target = false)
    {
        if(this.uses <= 0){
            return false;
        }
        if(target){
            this.target = target;
        }
        await this.applyModifiers();
        // @TODO: for now we will only let use one item per time.
        this.uses--;
        return await this.manager.events.emit('reldens.executeItem', this, target);
    }

}

module.exports = Usable;
