/**
 *
 * Reldens - Items System - Constants list
 *
 */

// @NOTE: constants are shorter because are usually used on events to be send between server and client.

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
    ACTION_ADD: 'invA',
    ACTION_REMOVE: 'invR',
    ACTION_MODIFY_QTY: 'invM',
    ACTION_EQUIP: 'invE',
    ACTION_UNEQUIP: 'invU',
    ACTION_MOD_APPLIED: 'invMa',
    ACTION_MOD_REVERTED: 'invMr',
    ACTION_EXECUTING: 'invEx',
    ACTION_EXECUTED: 'invAExd',
    ACTION_MANAGER_INIT: 'invMi',
    ACTION_SET_ITEMS: 'invSi',
    ACTION_SET_GROUPS: 'invSg',
    BEHAVIOR_SEND: 'send',
    BEHAVIOR_BROADCAST: 'broadcast',
    BEHAVIOR_BOTH: 'broadcast'
};
