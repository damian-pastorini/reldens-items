/**
 *
 * Reldens - Items System - RequirementsProcessor
 *
 */

const ExchangeRequirement = require('./exchange-requirement');
const { sc } = require('@reldens/utils');

class RequirementsCollection
{

    constructor(props)
    {
        this.requirements = sc.get(props, 'requirements', []);
    }

    count()
    {
        return this.requirements.length;
    }

    add(itemUid, itemKey, requiredItemKey, requiredQuantity, autoRemoveRequirement)
    {
        this.requirements.push(
            new ExchangeRequirement({
                itemUid,
                itemKey,
                requiredItemKey,
                requiredQuantity,
                autoRemoveRequirement
            })
        );
    }

    remove(itemUid)
    {
        let shouldDelete = false;
        let index = 0;
        for(let requirement of this.requirements){
            if(requirement.itemUid ===  itemUid){
                shouldDelete = true;
                break;
            }
            index++;
        }
        if(shouldDelete){
            delete this.requirements[index];
        }
    }

    fetchAllBy(propertyName, propertyValue)
    {
        return sc.fetchAllByProperty(this.requirements, propertyName, propertyValue);
    }
}

module.exports = RequirementsCollection;
