/**
 *
 * Reldens - Items System - RewardsCollection
 *
 */

const ExchangeReward = require('./exchange-reward');
const { sc } = require('@reldens/utils');

class RewardsCollection
{

    constructor(props)
    {
        this.rewards = sc.get(props, 'rewards', []);
    }

    count()
    {
        return this.rewards.length;
    }

    add(itemUid, itemKey, rewardItemKey, rewardQuantity, rewardItemIsRequired)
    {
        this.rewards.push(
            new ExchangeReward({
                itemUid,
                itemKey,
                rewardItemKey,
                rewardQuantity,
                rewardItemIsRequired
            })
        );
    }

    remove(itemUid)
    {
        let shouldDelete = false;
        let index = 0;
        for(let requirement of this.rewards){
            if(requirement.itemUid ===  itemUid){
                shouldDelete = true;
                break;
            }
            index++;
        }
        if(shouldDelete){
            delete this.rewards[index];
        }
    }

    fetchAllBy(propertyName, propertyValue)
    {
        return sc.fetchAllByProperty(this.rewards, propertyName, propertyValue);
    }
}

module.exports = RewardsCollection;
