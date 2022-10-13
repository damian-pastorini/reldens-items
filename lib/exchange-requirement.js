/**
 *
 * Reldens - Items System - ExchangeRequirement
 *
 */

class ExchangeRequirement
{

    constructor(props)
    {
        this.itemUid = props.itemUid;
        this.requiredItemKey = props.requiredItemKey;
        this.requiredQuantity = props.requiredQuantity;
        // @NOTE: this will remove the required item from the proper inventory. A use example will be "gold" been
        // auto-removed when the exchange finishes.
        this.autoRemoveRequirement = Boolean(props.autoRemoveRequirement);
    }

}

module.exports = ExchangeRequirement;
