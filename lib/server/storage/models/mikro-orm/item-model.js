/**
 *
 * Reldens - Items System - ItemModel
 *
 */

const { MikroOrmCore } = require('@reldens/storage');
const { EntitySchema } = MikroOrmCore;

class ItemModel
{

    beforeDestroyCalled = 0;
    afterDestroyCalled = 0;

    constructor(key, type, groupId, label, description, qty_limit, uses_limit, useTimeOut, execTimeOut, customData)
    {
        this.key = key;
        this.type = type;
        this.group_id = groupId;
        this.label = label;
        this.description = description;
        this.qty_limit = qty_limit;
        this.uses_limit = uses_limit;
        this.useTimeOut = useTimeOut;
        this.execTimeOut = execTimeOut;
        this.customData = customData;
    }

    static createByProps(props)
    {
        const {
            key,
            type,
            groupId,
            label,
            description,
            qty_limit,
            uses_limit,
            useTimeOut,
            execTimeOut,
            customData
        } = props;
        return new this(
            key,
            type,
            groupId,
            label,
            description,
            qty_limit,
            uses_limit,
            useTimeOut,
            execTimeOut,
            customData
        );
    }

    static relationsMappings()
    {
        return {
            item_group: {
                relation: 'GroupModel',
                entityName: 'group',
                reference: 'm:1',
                join: {
                    from: 'group_id',
                    to: 'id'
                }
            },
            items_modifiers: {
                relation: 'ModifiersModel',
                entityName: 'modifiers',
                reference: '1:m',
                join: {
                    from: 'id',
                    to: 'item_id'
                }
            }
        }
    }

}

const schema = new EntitySchema({
    class: ItemModel,
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
        type: {
            type: 'number'
        },
        group_id: {
            reference: 'm:1',
            type: 'GroupModel',
            nullable: true
        },
        label: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        qty_limit: {
            type: 'number',
            default: 0
        },
        uses_limit: {
            type: 'number',
            default: 0
        },
        useTimeOut: {
            type: 'number'
        },
        execTimeOut: {
            type: 'number'
        },
        customData: {
            type: 'string'
        },
        items_modifiers: {
            reference: '1:m',
            mappedBy: 'item_id',
            type: 'ModifiersModel',
            nullable: true
        }
    }
});

module.exports = {
    ItemModel,
    entity: ItemModel,
    schema
};
