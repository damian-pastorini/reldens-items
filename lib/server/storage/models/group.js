/**
 *
 * Reldens - Items System - Group
 *
 */

const { Model } = require('objection');

class GroupModel extends Model
{

    static get tableName()
    {
        return 'items_group';
    }

}

module.exports.GroupModel = GroupModel;
