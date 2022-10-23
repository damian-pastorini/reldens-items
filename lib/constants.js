/**
 *
 * Reldens - Items System - Constants list
 *
 */

// @NOTE: constants are shorter because are usually used on events to be send between server and client.

let actionPref = 'rinv';

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
        ITEM_BASE: 0,
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
    }
};
