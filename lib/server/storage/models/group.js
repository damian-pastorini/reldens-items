/**
 *
 * Reldens - Items System - Group
 *
 */

const { ModelClass } = require('@reldens/storage');

class GroupModel extends ModelClass
{

    static get tableName()
    {
        return 'items_group';
    }

}

module.exports.GroupModel = GroupModel;
