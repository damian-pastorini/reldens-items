/**
 *
 * Reldens - Items System - Usable
 *
 */

const ItemBase = require('./item-base');
const ItemsConst = require('../../constants');
const ItemsEvents = require('../../items-events');

class Usable extends ItemBase
{

    constructor(props)
    {
        super(props);
        this.type = ItemsConst.TYPE_USABLE;
        this.uses = {}.hasOwnProperty.call(props, 'uses') ? props.uses : 1;
        this.usesLimit = {}.hasOwnProperty.call(props, 'usesLimit') ? props.usesLimit : false;
        this.canUse = true;
        this.removeAfterUse = true;
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
            await this.manager.events.emit(ItemsEvents.EXECUTING_ITEM, this);
            this.execTimer = setTimeout(async () => {
                await this.executeItem();
            }, this.execTimeOut);
        } else {
            await this.executeItem();
        }
    }

    async executeItem()
    {
        await this.applyModifiers();
        // @TODO: temporal, only use one item per time.
        this.uses--;
        if(this.removeAfterUse && this.uses <= 0){
            this.manager.removeItem(this.key);
        }
        return await this.manager.events.emit(ItemsEvents.EXECUTED_ITEM, this);
    }

}

module.exports = Usable;
