/**
 *
 * Reldens - Items System - Constants list
 *
 */

let actionPref = 'rinv';
let errorsPrefix = 'items.';
let exchangeErrorPrefix = 'exchange.';
let requirementsErrorPrefix = 'requirements.';
let rewardsErrorPrefix = 'reward.';
let equipmentPrefix = 'equipment.';

module.exports = {
    SET: 'set',
    INCREASE: 'increase',
    DECREASE: 'decrease',
    ACTIONS_PREF: actionPref,
    ACTION_ADD: actionPref+'A',
    ACTION_REMOVE: actionPref+'R',
    ACTION_MODIFY_QTY: actionPref+'M',
    ACTION_EQUIP: actionPref+'E',
    ACTION_UNEQUIP: actionPref+'U',
    ACTION_MOD_APPLIED: actionPref+'Ma',
    ACTION_MOD_REVERTED: actionPref+'Mr',
    ACTION_EXECUTING: actionPref+'Ex',
    ACTION_EXECUTED: actionPref+'AExd',
    ACTION_MANAGER_INIT: actionPref+'Mi',
    ACTION_SET_ITEMS: actionPref+'Si',
    ACTION_SET_GROUPS: actionPref+'Sg',
    BEHAVIOR_SEND: 'send',
    BEHAVIOR_BROADCAST: 'broadcast',
    BEHAVIOR_BOTH: 'both',
    TYPES: {
        ITEM_BASE: 10,
        EQUIPMENT: 1,
        USABLE: 2,
        SINGLE: 3, // @NOTE: single instance items the quantity will be grouped in a single inventory object.
        SINGLE_EQUIPMENT: 4,
        SINGLE_USABLE: 5
    },
    TRADE_ACTIONS: {
        BUY: 'buy',
        SELL: 'sell',
        TRADE: 'trade'
    },
    ERROR_CODES: {
        PREFIX: errorsPrefix,
        UNDEFINED_ITEM: errorsPrefix+'undefinedItem',
        UNDEFINED_METHOD_INVENTORY_ID: errorsPrefix+'undefinedMethodInventoryId',
        UNDEFINED_ITEM_KEY: errorsPrefix+'undefinedItemKey',
        INVALID_ITEM_INSTANCE: errorsPrefix+'invalidItemInstance',
        LOCKED_FOR_ADD_ITEM: errorsPrefix+'lockedForAddItem',
        MAX_TOTAL_REACHED_FOR_ADD_ITEM: errorsPrefix+'maxTotalReachedForAddItem',
        ITEM_EXISTS_FOR_ADD_ITEM: errorsPrefix+'itemExistsForAddItem',
        ITEM_LIMIT_EXCEEDED_FOR_ADD_ITEM: errorsPrefix+'itemLimitExceededForAddItem',
        ADD_ITEMS_ERROR: errorsPrefix+'addItemsError',
        LOCKED_FOR_SET_ITEM: errorsPrefix+'lockedForSetItem',
        LOCKED_FOR_REMOVE_ITEM: errorsPrefix+'lockedForRemoveItem',
        KEY_NOT_FOUND: errorsPrefix+'keyNotFound',
        LOCKED_FOR_MODIFY_ITEM_QTY: errorsPrefix+'lockedForModifyItemQty',
        QTY_NOT_A_NUMBER: errorsPrefix+'qtyNotANumber',
        ITEM_QTY_LIMIT_EXCEEDED: errorsPrefix+'itemQtyLimitExceeded',
        LOCKED_FOR_SET_ITEMS: errorsPrefix+'lockedForSetItems',
        EXCHANGE: {
            MISSING_CONFIRMATION: errorsPrefix+exchangeErrorPrefix+'missingConfirmation',
            INVALID_PUSHED_QUANTITY: errorsPrefix+exchangeErrorPrefix+'invalidPushedQuantity',
            INVALID_QUANTITY: errorsPrefix+exchangeErrorPrefix+'invalidQuantity',
            INVALID_EXCHANGE: errorsPrefix+exchangeErrorPrefix+'invalidExchange',
            DECREASE_QUANTITY: errorsPrefix+exchangeErrorPrefix+'decreaseQuantity',
            ITEM_ADD: errorsPrefix+exchangeErrorPrefix+'itemAdd'
        },
        REQUIREMENTS: {
            ITEM_NOT_PRESENT: errorsPrefix+requirementsErrorPrefix+'itemNotPresent',
            QUANTITY_NOT_AVAILABLE: errorsPrefix+requirementsErrorPrefix+'quantityNotAvailable',
            ITEM_NOT_PUSHED: errorsPrefix+requirementsErrorPrefix+'itemNotPushed',
            ITEM_QUANTITY_NOT_PUSHED: errorsPrefix+requirementsErrorPrefix+'itemQuantityNotPushed',
            ITEM_DOES_NOT_EXISTS: errorsPrefix+requirementsErrorPrefix+'itemDoesNotExists',
            ITEM_ADD: errorsPrefix+requirementsErrorPrefix+'itemAdd'
        },
        REWARD: {
            DOES_NOT_EXISTS: errorsPrefix+rewardsErrorPrefix+'doesNotExists',
            MISSING_ITEM: errorsPrefix+rewardsErrorPrefix+'missingItem',
            ITEM_NOT_PRESENT: errorsPrefix+rewardsErrorPrefix+'itemNotPresent',
            QUANTITY_NOT_AVAILABLE: errorsPrefix+rewardsErrorPrefix+'quantityNotAvailable',
            MISSING_PUSHED: errorsPrefix+rewardsErrorPrefix+'missingPushed',
            GET_ITEM_DOES_NOT_EXISTS: errorsPrefix+rewardsErrorPrefix+'getItemDoesNotExists',
            PROCESS_ITEM: errorsPrefix+rewardsErrorPrefix+'processItem',
            PROCESS_INVENTORY: errorsPrefix+rewardsErrorPrefix+'processInventory',
            ADD_ITEMS: errorsPrefix+rewardsErrorPrefix+'addItems',
            QUANTITY_OVERLOAD: errorsPrefix+rewardsErrorPrefix+'quantityOverload'
        },
        EQUIPMENT: {
            MODIFIERS_APPLY: errorsPrefix+equipmentPrefix+'modifiersApply',
            MODIFIERS_REVERT: errorsPrefix+equipmentPrefix+'modifiersRevert'
        }
    }
};
