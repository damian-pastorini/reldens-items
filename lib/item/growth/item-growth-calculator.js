/**
 *
 * Reldens - Items System - ItemGrowthCalculator
 *
 * The growth maths of an item: the item share of the experience gained by its owner, the item level reached with its
 * accumulated experience ("levels" maps every level to its required experience, the levels never go down) and the
 * modifier value of a level (the original value increased by the configured percent on every level after the first,
 * an integer value is rounded away from zero on the halves, a decimal value keeps its decimals and a value that is not
 * a number is never scaled).
 *
 */

const ItemsConst = require('../../constants');

class ItemGrowthCalculator
{

    static experienceFor(experienceShare, experienceAdded)
    {
        let share = Number.isFinite(Number(experienceShare))
            ? Number(experienceShare)
            : ItemsConst.GROWTH.PERCENT_BASE;
        let addedExperience = Number(experienceAdded);
        if(!Number.isFinite(share) || !Number.isFinite(addedExperience)){
            return 0;
        }
        if(0 >= share || 0 >= addedExperience){
            return 0;
        }
        return Math.floor(addedExperience * share / ItemsConst.GROWTH.PERCENT_BASE);
    }

    static levelFor(experience, levels, currentLevel)
    {
        let reachedLevel = Number(currentLevel) || ItemsConst.GROWTH.DEFAULT_LEVEL;
        if(!levels){
            return reachedLevel;
        }
        for(let levelKey of Object.keys(levels)){
            let level = Number(levelKey);
            if(level > reachedLevel && Number(experience) >= Number(levels[levelKey])){
                reachedLevel = level;
            }
        }
        return reachedLevel;
    }

    static scaledValue(originalValue, level, increasePercentPerLevel)
    {
        let value = Number(originalValue);
        if(!Number.isFinite(value)){
            return originalValue;
        }
        let increasedLevels = Math.max(0, Number(level) - ItemsConst.GROWTH.DEFAULT_LEVEL) || 0;
        let scaledValue = value * (
            ItemsConst.GROWTH.PERCENT_BASE + increasedLevels * (Number(increasePercentPerLevel) || 0)
        ) / ItemsConst.GROWTH.PERCENT_BASE;
        if(!Number.isInteger(value)){
            return scaledValue;
        }
        return Math.sign(scaledValue) * Math.round(Math.abs(scaledValue));
    }

}

module.exports = ItemGrowthCalculator;
