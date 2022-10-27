/**
 *
 * Reldens - Items System - ExchangeReward
 *
 */

class ExchangeReward
{

    constructor(props)
    {
        this.itemUid = props.itemUid || '';
        this.itemKey = props.itemKey || '';
        this.rewardItemKey = props.rewardItemKey;
        this.rewardQuantity = Number(props.rewardQuantity);
        // @NOTE: this will remove the reward item from the proper inventory. A use example will be "gold" been
        // auto-removed when the exchange finishes.
        this.rewardItemIsRequired = Boolean(props.rewardItemIsRequired);
    }

}

module.exports = ExchangeReward;
