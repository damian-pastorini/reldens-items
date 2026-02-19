/**
 *
 * Reldens - Mock Model
 *
 */

class MockModel
{

    constructor(data = {})
    {
        this.id = data.id || 1;
        this.item_id = data.item_id || 1;
        this.key = data.key || 'test-item';
        this.type = data.type || 10;
        this.label = data.label || 'Test Item';
        this.description = data.description || 'A test item';
        this.qty = data.qty || 1;
        this.qty_limit = data.qty_limit || 99;
        this.uses_limit = data.uses_limit || 0;
        this.useTimeOut = data.useTimeOut || 0;
        this.execTimeOut = data.execTimeOut || 0;
        this.customData = data.customData || null;
        this.modifiers = data.modifiers || null;
        this.equip_options = data.equip_options || null;
    }

    toObject()
    {
        return {
            id: this.id,
            item_id: this.item_id,
            key: this.key,
            type: this.type,
            label: this.label,
            description: this.description,
            qty: this.qty,
            qty_limit: this.qty_limit,
            uses_limit: this.uses_limit,
            useTimeOut: this.useTimeOut,
            execTimeOut: this.execTimeOut,
            customData: this.customData,
            modifiers: this.modifiers,
            equip_options: this.equip_options
        };
    }

}

module.exports.MockModel = MockModel;
