/**
 *
 * Reldens - Items System - ExchangeReward
 *
 */

class ExchangeReward
{

    constructor(props)
    {
        this.itemUid = props.itemUid;
        this.rewardItemKey = props.rewardItemKey;
        this.rewardQuantity = props.rewardQuantity;
        // @NOTE: this will remove the reward item from the proper inventory. A use example will be "gold" been
        // auto-removed when the exchange finishes.
        this.rewardItemIsRequired = Boolean(props.rewardItemIsRequired);
    }

}

module.exports = ExchangeReward;
