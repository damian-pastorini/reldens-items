/**
 *
 * Reldens - Items System - Events list
 *
 */

// @NOTE: events are long because because need to be more descriptive.

let pref = 'reldens.items.';

module.exports = {
    PREF: pref,
    MANAGER_INIT: pref+'setup',
    LOADED_OWNER_ITEMS: pref+'loadedOwnerItems',
    SET_ITEMS: pref+'setItems',
    SET_GROUPS: pref+'setGroups',
    EQUIP_ITEM: pref+'equipItem',
    UNEQUIP_ITEM: pref+'unequipItem',
    ADD_ITEM: pref+'addItem',
    ADD_ITEM_BEFORE: pref+'addItemBefore',
    REMOVE_ITEM: pref+'removeItem',
    MODIFY_ITEM_QTY: pref+'modifyItemQty',
    EQUIP_BEFORE: pref+'equipBefore', // this will be followed by: +(revert ? 'Revert': 'Apply')+'Modifiers'
    EQUIP: pref+'equip', // this will be followed by: +(revert ? 'Reverted' : 'Applied')+'Modifiers'
    EXECUTING_ITEM: pref+'executingItem',
    EXECUTED_ITEM: pref+'executedItem',
    VALIDATE: pref+'validate'
};
