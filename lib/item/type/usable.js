/**
 *
 * Reldens - Items System - Usable
 *
 */

const ItemBase = require('./item-base');
const ItemsConst = require('../../constants');
const ItemsEvents = require('../../items-events');
const { sc } = require('@reldens/utils');

class Usable extends ItemBase
{

    constructor(props)
    {
        super(props);
        this.type = ItemsConst.TYPE_USABLE;
        this.uses = sc.hasOwn(props, 'uses') ? props.uses : 1;
        this.currentUses = this.uses;
        this.usesLimit = sc.hasOwn(props, 'usesLimit') ? props.usesLimit : false;
        this.canUse = true;
        this.removeAfterUse = true;
        // use delay:
        this.useTimeOut = false;
        this.useTimer = false;
        // execution delay:
        this.execTimeOut = false;
        this.execTimer = false;
        this.removeQtyAfterUse = sc.hasOwn(props, 'removeQtyAfterUse') ? props.removeQtyAfterUse : 1;
    }

    async use(target = false)
    {
        if(!this.canUse || this.currentUses <= 0){
            return false;
        }
        if(target){
            this.target = target;
        }
        // this will cause an use delay:
        if(this.useTimeOut){
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
            await this.manager.events.emit(ItemsEvents.EXECUTING_ITEM, this);
            await this.executeItem();
        }
    }

    async executeItem()
    {
        await this.applyModifiers();
        this.currentUses--;
        if(this.removeAfterUse && this.currentUses <= 0){
            if(this.qty <= this.removeQtyAfterUse){
                await this.manager.removeItem(this.getInventoryId());
            } else {
                await this.manager.modifyItemQty(ItemsConst.DECREASE, this.getInventoryId(), this.removeQtyAfterUse);
                this.currentUses = this.uses;
            }
        }
        return await this.manager.events.emit(ItemsEvents.EXECUTED_ITEM, this);
    }

}

module.exports = Usable;
