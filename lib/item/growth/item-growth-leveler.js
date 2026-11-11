/**
 *
 * Reldens - Items System - ItemGrowthLeveler
 *
 * Grows the items that have a "growth" custom data with the experience gained by their owner, for example:
 * {"growth": {"experienceShare": 100, "modifiersIncreasePercentPerLevel": 50, "requireEquipped": true,
 * "levels": {"2": 5, "3": 30}}}
 * - "experienceShare": percent of the owner experience that the item receives (100 when missing).
 * - "requireEquipped": only an equipped item grows, unless it is false.
 * - "levels": the experience required by every level, the level never goes down.
 * - "modifiersIncreasePercentPerLevel": every level after the first increases the modifiers values by that percent of
 * their original value (the set and method operations are never scaled).
 * Every item instance keeps its own level ("growthLevel") and experience ("growthExperience"): call initializeItem()
 * with the stored values (or without them for a new item) and addOwnerExperience() every time the owner gains
 * experience. On a level up an equipped item is unequipped, its modifiers are scaled, GROWTH_LEVEL_UP is fired (its
 * listeners can still change the item data before it is sent), UPDATE_ITEM is fired (the Sender sends the item update
 * to the client) and the item is equipped again, only when nothing equipped it during the level up, so its modifiers
 * are never applied twice. GROWTH_EXPERIENCE_ADDED is fired after every experience added, to persist the item growth.
 * The level up of an item is kept on its pendingGrowth promise, so an equip toggle can wait for it before reading the
 * item equipped state.
 * The experience added to the same item runs in order, one call after the previous one is done, so the experience
 * received during a level up is never lost. A failed step (the unequip, a listener or the equip again) is stored as the
 * item manager last error: a failed unequip stops the level up (the next experience added reaches the level again) and
 * the failed events never stop the equip again.
 *
 */

const ItemGrowthCalculator = require('./item-growth-calculator');
const ItemsConst = require('../../constants');
const ItemsEvents = require('../../items-events');
const { Logger } = require('@reldens/utils');

class ItemGrowthLeveler
{

    initializeItem(item, level, experience)
    {
        if(!item?.growth){
            return false;
        }
        item.growthLevel = Number(level) || ItemsConst.GROWTH.DEFAULT_LEVEL;
        item.growthExperience = Number(experience) || 0;
        this.scaleModifiers(item);
        return true;
    }

    async addOwnerExperience(manager, experienceAdded)
    {
        let grownItems = 0;
        for(let item of this.fetchGrowableItems(manager)){
            if(await this.addItemExperience(item, experienceAdded)){
                grownItems++;
            }
        }
        return grownItems;
    }

    async addItemExperience(item, experienceAdded)
    {
        if(!item?.growth){
            return false;
        }
        item.pendingGrowth = this.applyItemExperience(item, experienceAdded);
        return await item.pendingGrowth;
    }

    async applyItemExperience(item, experienceAdded)
    {
        await item.pendingGrowth;
        if(false !== item.growth.requireEquipped && !item.equipped){
            return false;
        }
        let itemExperience = ItemGrowthCalculator.experienceFor(item.growth.experienceShare, experienceAdded);
        if(0 === itemExperience){
            return false;
        }
        let currentLevel = Number(item.growthLevel) || ItemsConst.GROWTH.DEFAULT_LEVEL;
        item.growthLevel = currentLevel;
        item.growthExperience = (Number(item.growthExperience) || 0) + itemExperience;
        let reachedLevel = ItemGrowthCalculator.levelFor(item.growthExperience, item.growth.levels, currentLevel);
        if(reachedLevel > currentLevel){
            await this.levelUpItem(item, reachedLevel);
        }
        await this.runGrowthStep(
            item,
            ItemsEvents.GROWTH_EXPERIENCE_ADDED,
            () => item.fireEvent(ItemsEvents.GROWTH_EXPERIENCE_ADDED, item, itemExperience)
        );
        return true;
    }

    async levelUpItem(item, reachedLevel)
    {
        let wasEquipped = Boolean(item.equipped);
        if(wasEquipped && !await this.runGrowthStep(item, 'unequip', () => item.unequip())){
            return false;
        }
        item.growthLevel = reachedLevel;
        this.scaleModifiers(item);
        let levelUpFired = await this.runGrowthStep(
            item,
            ItemsEvents.GROWTH_LEVEL_UP,
            () => item.fireEvent(ItemsEvents.GROWTH_LEVEL_UP, item)
        );
        let updateFired = await this.runGrowthStep(
            item,
            ItemsEvents.UPDATE_ITEM,
            () => item.fireEvent(ItemsEvents.UPDATE_ITEM, item)
        );
        if(wasEquipped && !item.equipped && !await this.runGrowthStep(item, 'equip', () => item.equip())){
            return false;
        }
        return levelUpFired && updateFired;
    }

    async runGrowthStep(item, stepName, step)
    {
        try {
            await step();
            return true;
        } catch(error) {
            Logger.error('Item growth step "'+stepName+'" failed for item "'+item.getInventoryId()+'".', error);
            item.manager.setError(
                'Item growth step failed: '+stepName,
                ItemsConst.ERROR_CODES.GROWTH.STEP_FAILED,
                {itemUid: item.getInventoryId(), stepName},
                error
            );
            return false;
        }
    }

    scaleModifiers(item)
    {
        let currentModifiers = item.modifiers || {};
        for(let modifierId of Object.keys(currentModifiers)){
            let modifier = currentModifiers[modifierId];
            if(-1 !== ItemsConst.GROWTH.NOT_SCALABLE_OPERATIONS.indexOf(modifier.operation)){
                continue;
            }
            modifier.value = ItemGrowthCalculator.scaledValue(
                modifier.originalValue,
                item.growthLevel,
                item.growth.modifiersIncreasePercentPerLevel
            );
        }
    }

    fetchGrowableItems(manager)
    {
        let items = manager?.items || {};
        return Object.keys(items).map(itemKey => items[itemKey]).filter(item => item?.growth);
    }

}

module.exports = ItemGrowthLeveler;
