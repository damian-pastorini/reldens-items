/**
 *
 * Reldens - Items System - Usable
 *
 * This item type has a use() method to execute the item modifiers. This use() method is affected by the item
 * configuration in which you can specify timers for how frequently you can use the item or how much it takes to be
 * executed, and at the time it will have limiters for amount of uses. The use is counted when use() accepts it, before
 * any await, so a second use started before the first one is executed can not pass the uses check. A use that spends
 * the last use of a unit reserves that unit quantity decrease, and when the stack still has units that are not reserved
 * the uses of the next unit are ready at once, so every unit of a stack can be used in the same tick while two uses of
 * the last unit apply it once.
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
        this.useTimer = false;
        // execution delay:
        this.execTimer = false;
        this.removeQtyAfterUse = sc.get(props, 'removeQtyAfterUse', 1);
        this.autoRemoveItemOnZeroQty = sc.get(props, 'autoRemoveItemOnZeroQty', true);
        this.reservedQtyDecrease = 0;
    }

    async use(target = false)
    {
        if(!this.canUse || 0 >= this.currentUses){
            return false;
        }
        this.currentUses--;
        let isUnitUsed = 0 === this.currentUses;
        if(isUnitUsed && this.removeAfterUse){
            this.reservedQtyDecrease += this.removeQtyAfterUse;
            this.prepareNextUnitUses();
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
        if(!this.execTimeOut){
            await this.executeItem(isUnitUsed);
            return;
        }
        this.execTimer = setTimeout(async () => {
            await this.executeItem(isUnitUsed);
        }, this.execTimeOut);
    }

    prepareNextUnitUses()
    {
        if(0 < this.currentUses || (-1 !== this.qty && this.qty <= this.reservedQtyDecrease)){
            return false;
        }
        this.currentUses = this.uses;
        return true;
    }

    async executeItem(isUnitUsed)
    {
        await this.applyModifiers();
        if(!this.removeAfterUse || !isUnitUsed){
            return await this.manager.fireEvent(ItemsEvents.EXECUTED_ITEM, this);
        }
        await this.manager.modifyItemQty(ItemsConst.DECREASE, this.getInventoryId(), this.removeQtyAfterUse);
        this.reservedQtyDecrease -= this.removeQtyAfterUse;
        this.prepareNextUnitUses();
        return await this.manager.fireEvent(ItemsEvents.EXECUTED_ITEM, this);
    }

}

module.exports = Usable;
