/**
 *
 * Reldens - Items System - GroupModel
 *
 */

const { MikroOrmCore } = require('@reldens/storage');
const { EntitySchema } = MikroOrmCore;

class GroupModel
{

    beforeDestroyCalled = 0;
    afterDestroyCalled = 0;

    constructor(key, label, description, filesName, sort, itemsLimit, limitPerItem)
    {
        this.key = key;
        this.label = label;
        this.description = description;
        this.files_name = filesName;
        this.sort = sort;
        this.items_limit = itemsLimit;
        this.limit_per_item = limitPerItem;
    }

}

class GroupModelFactory
{
    static create(props)
    {
        const {key, label, description, filesName, sort, itemsLimit, limitPerItem} = props;
        return new GroupModel(key, label, description, filesName, sort, itemsLimit, limitPerItem);
    }
}

const schema = new EntitySchema({
    class: GroupModel,
    properties: {
        _id: {
            primary: true,
            type: 'ObjectID'
        },
        id: {
            type: 'string',
            serializedPrimaryKey: true
        },
        key: {
            type: 'string'
        },
        label: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        files_name: {
            type: 'string'
        },
        sort: {
            type: 'number'
        },
        items_limit: {
            type: 'number'
        },
        limit_per_item: {
            type: 'number'
        }
    },
});

module.exports = {
    GroupModel,
    entity: GroupModel,
    factory: GroupModelFactory,
    schema
};
