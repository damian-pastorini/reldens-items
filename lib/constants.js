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
    TYPE_BASE: 'itb',
    TYPE_EQUIPMENT: 'ite',
    TYPE_USABLE: 'itu',
    OPS: {
        INC: 1,
        DEC: 2,
        DIV: 3,
        MUL: 4,
        INC_P: 5,
        DEC_P: 6,
        SET: 7,
        METHOD: 8
    },
    PROP_GET: 'g',
    PROP_SET: 's',
    MOD_APPLIED: 'ma',
    MOD_REVERTED: 'mr',
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
    BEHAVIOR_BOTH: 'broadcast'
};
