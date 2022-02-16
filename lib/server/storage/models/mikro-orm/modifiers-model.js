/**
 *
 * Reldens - Items System - ModifiersModel
 *
 */

const { MikroOrmCore } = require('@reldens/storage');
const { EntitySchema } = MikroOrmCore;

class ModifiersModel
{

    beforeDestroyCalled = 0;
    afterDestroyCalled = 0;

    constructor(itemId, key, property_key, operation, value, maxProperty)
    {
        this.item_id = itemId;
        this.key = key;
        this.property_key = property_key;
        this.operation = operation;
        this.value = value;
        this.maxProperty = maxProperty;
    }

    static createByProps(props)
    {
        const {itemId, key, property_key, operation, value, maxProperty} = props;
        return new this(itemId, key, property_key, operation, value, maxProperty);
    }

    static relationsMappings()
    {
        return {
            parent_item_id: {
                relation: 'ItemModel',
                entityName: 'item',
                reference: 'm:1',
                join: {
                    from: 'item_id',
                    to: 'id'
                }
            }
        };
    }

}

const schema = new EntitySchema({
    class: ModifiersModel,
    properties: {
        _id: {
            primary: true,
            type: 'ObjectID'
        },
        id: {
            type: 'string',
            serializedPrimaryKey: true
        },
        item_id: {
            reference: 'm:1',
            type: 'ItemModel',
            nullable: true
        },
        key: {
            type: 'string'
        },
        property_key: {
            type: 'string'
        },
        operation: {
            type: 'number'
        },
        value: {
            type: 'string'
        },
        maxProperty: {
            type: 'string'
        }
    },
});

module.exports = {
    ModifiersModel,
    entity: ModifiersModel,
    schema
};
