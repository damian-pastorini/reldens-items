
let pref = 'reldens.items.';

module.exports = {
    MANAGER_INIT: pref+'setup',
    SET_ITEMS: pref+'setItems',
    SET_GROUPS: pref+'setGroups',
    EQUIP_ITEM: pref+'equipItem',
    UNEQUIP_ITEM: pref+'unequipItem',
    ADD_ITEM: pref+'addItem',
    REMOVE_ITEM: pref+'removeItem',
    MODIFY_ITEM_QTY: pref+'modifyItemQty',
    EQUIP_BEFORE: pref+'equipBefore', // this will be followed by: +(revert ? 'Revert': 'Apply')+'Modifiers'
    EQUIP: pref+'equip', // this will be followed by: +(revert ? 'Reverted' : 'Applied')+'Modifiers'
    EXECUTING_ITEM: pref+'executingItem',
    EXECUTED_ITEM: pref+'executedItem'
};
