
const Item = require('./item');
const ItemsConst = require('../../constants');
const ItemsEvents = require('../../items-events');

class Usable extends Item
{

    constructor(props)
    {
        super(props);
        this.type = ItemsConst.TYPE_USABLE;
        this.uses = {}.hasOwnProperty.call(props, 'uses') ? props.uses : 1;
        this.canUse = true;
        // use delay:
        this.useTimeOut = false;
        this.useTimer = false;
        // execution delay:
        this.execTimeOut = false;
        this.execTimer = false;
    }

    async use(target = false)
    {
        if(!this.canUse || this.uses <= 0){
            return false;
        }
        if(target){
            this.target = target;
        }
        // this will cause an use delay:
        if(this.useTimeOut) {
            this.canUse = false;
            this.useTimer = setTimeout(async () => {
                this.canUse = true;
            }, this.useTimeOut);
        }
        // @NOTE: the execTimeout should be always longer than the useTimeOut, otherwise the use delay is pointless.
        if(this.execTimeOut){
            await this.manager.events.emit(ItemsEvents.EXECUTING_ITEM, this, target);
            this.execTimer = setTimeout(async () => {
                await this.executeItem(target);
            }, this.execTimeOut);
        } else {
            await this.executeItem(target);
        }
    }

    async executeItem(target)
    {
        await this.applyModifiers();
        // @TODO: for now we will only let use one item per time.
        this.uses--;
        return await this.manager.events.emit(ItemsEvents.EXECUTED_ITEM, this, target);
    }

}

module.exports = Usable;
