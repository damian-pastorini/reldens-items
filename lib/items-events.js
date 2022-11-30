/**
 *
 * Reldens - Items System - Events list
 *
 */

// @NOTE: events names are long because these need to be descriptive.

let pref = 'reldens.items.';

module.exports = {
    PREF: pref,
    MANAGER_INIT: pref+'setup',
    EXCHANGE: {
        INITIALIZED: pref+'initialized',
        CANCELED: pref+'canceled',
        INVALID_PUSH: pref+'invalidPush',
        ITEM_PUSHED: pref+'itemPushed',
        ITEM_REMOVE: pref+'itemRemove',
        CONFIRM: pref+'confirm',
        DISCONFIRM: pref+'disconfirm',
        BEFORE_FINALIZE: pref+'beforeFinalize',
        FINALIZED: pref+'finalized'
    },
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
