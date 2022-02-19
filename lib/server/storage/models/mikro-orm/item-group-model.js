/**
 *
 * Reldens - Items System - ItemGroupModel
 *
 */

const { MikroOrmCore } = require('@reldens/storage');
const { EntitySchema } = MikroOrmCore;

class ItemGroupModel
{

    beforeDestroyCalled = 0;
    afterDestroyCalled = 0;

    constructor(key, label, description, files_name, sort, items_limit, limit_per_item)
    {
        this.key = key;
        this.label = label;
        this.description = description;
        this.files_name = files_name;
        this.sort = sort;
        this.items_limit = items_limit;
        this.limit_per_item = limit_per_item;
    }

    static createByProps(props)
    {
        const {key, label, description, files_name, sort, items_limit, limit_per_item} = props;
        return new this(key, label, description, files_name, sort, items_limit, limit_per_item);
    }

}

const schema = new EntitySchema({
    class: ItemGroupModel,
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
    ItemGroupModel,
    entity: ItemGroupModel,
    schema
};
