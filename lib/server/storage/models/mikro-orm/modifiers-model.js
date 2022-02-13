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

    constructor(itemId, key, propertyKey, operation, value, maxProperty)
    {
        this.item_id = itemId;
        this.key = key;
        this.property_key = propertyKey;
        this.operation = operation;
        this.value = value;
        this.maxProperty = maxProperty;
    }

}

class ModifiersModelFactory
{
    static create(props)
    {
        const {itemId, key, propertyKey, operation, value, maxProperty} = props;
        return new ModifiersModel(itemId, key, propertyKey, operation, value, maxProperty);
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

const relationsMappings = {
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

module.exports = {
    ModifiersModel,
    entity: ModifiersModel,
    factory: ModifiersModelFactory,
    schema,
    relationsMappings
};
