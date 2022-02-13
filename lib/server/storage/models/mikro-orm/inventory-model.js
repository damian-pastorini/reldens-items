/**
 *
 * Reldens - Items System - InventoryModel
 *
 */

const { MikroOrmCore } = require('@reldens/storage');
const { EntitySchema } = MikroOrmCore;

class InventoryModel
{

    beforeDestroyCalled = 0;
    afterDestroyCalled = 0;

    constructor(ownerId, itemId, qty, remainingUses, isActive)
    {
        this.owner_id = ownerId;
        this.item_id = itemId;
        this.qty = qty;
        this.remaining_uses = remainingUses;
        this.is_active = isActive;
    }

}

class InventoryModelFactory
{
    static create(props)
    {
        const {ownerId, itemId, qty, remainingUses, isActive} = props;
        return new InventoryModel(ownerId, itemId, qty, remainingUses, isActive);
    }
}

const schema = new EntitySchema({
    class: InventoryModel,
    properties: {
        _id: {
            primary: true,
            type: 'ObjectID'
        },
        id: {
            type: 'string',
            serializedPrimaryKey: true
        },
        owner_id: {
            type: 'number'
        },
        item_id: {
            reference: 'm:1',
            type: 'ItemModel'
        },
        qty: {
            type: 'number'
        },
        remaining_uses: {
            type: 'number'
        },
        is_active: {
            type: 'boolean'
        }
    },
});

const relationsMappings = {
    items_item: {
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
    InventoryModel,
    entity: InventoryModel,
    factory: InventoryModelFactory,
    schema,
    relationsMappings
};
