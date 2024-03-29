/**
 *
 * Reldens - Items System - Usable
 *
 * This item type has a use() method to execute the item modifiers. This use() method is affected by the item
 * configuration in which you can specify timers for how frequently you can use the item or how much it takes to be
 * executed, and at the time it will have limiters for amount of uses.
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
        this.type = ItemsConst.TYPES.USABLE;
        this.uses = sc.get(props, 'uses', 1);
        this.currentUses = this.uses;
        this.usesLimit = sc.get(props, 'usesLimit', false);
        this.canUse = true;
        this.removeAfterUse = true;
        // use delay:
        this.useTimeOut = false;
        this.useTimer = false;
        // execution delay:
        this.execTimeOut = false;
        this.execTimer = false;
        this.removeQtyAfterUse = sc.get(props, 'removeQtyAfterUse', 1);
        this.autoRemoveItemOnZeroQty = sc.get(props, 'autoRemoveItemOnZeroQty', true);
    }

    async use(target = false)
    {
        if(!this.canUse || 0 >= this.currentUses){
            return false;
        }
        if(target){
            this.target = target;
        }
        // this will cause a use delay:
        if(this.useTimeOut){
            this.canUse = false;
            this.useTimer = setTimeout(async () => {
                this.canUse = true;
            }, this.useTimeOut);
        }
        // @NOTE: the execTimeout should be always longer than the useTimeOut, otherwise the use delay is pointless.
        await this.manager.fireEvent(ItemsEvents.EXECUTING_ITEM, this);
        if(false === this.execTimeOut){
            await this.executeItem();
            return;
        }
        this.execTimer = setTimeout(async () => {
            await this.executeItem();
        }, this.execTimeOut);
    }

    async executeItem()
    {
        await this.applyModifiers();
        this.currentUses--;
        if(!this.removeAfterUse || 0 < this.currentUses){
            return await this.manager.fireEvent(ItemsEvents.EXECUTED_ITEM, this);
        }
        await this.manager.modifyItemQty(ItemsConst.DECREASE, this.getInventoryId(), this.removeQtyAfterUse);
        this.currentUses = this.uses;
        return await this.manager.fireEvent(ItemsEvents.EXECUTED_ITEM, this);
    }

}

module.exports = Usable;
