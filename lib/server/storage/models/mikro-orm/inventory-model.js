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

    static createByProps(props)
    {
        const {ownerId, itemId, qty, remainingUses, isActive} = props;
        return new this(ownerId, itemId, qty, remainingUses, isActive);
    }

    static relationMappings()
    {
        return  {
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
            type: 'ItemModel',
            nullable: true
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

module.exports = {
    InventoryModel,
    entity: InventoryModel,
    schema
};
