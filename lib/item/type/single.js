/**
 *
 * Reldens - Items System - ItemSingle
 *
 * Basically a shortcut class for single instance items.
 * Single items are the ones that will be handle as single entities in the inventory, this is kind of tricky to explain
 * so I will try to put it in pseudo-code.
 *
 * Let's say you add a normal item to the inventory multiple times:
 * inventory.addItem(normalItemInstance1);
 * inventory['test1'] = normalItemInstance1; // where item.key = 'test1'
 * inventory.addItem(normalItemInstance2); // this is the same class as the test1 item but here the item.key = 'test2'
 * inventory['test2'] = normalItemInstance2; // if we use the same key it will throw an error
 *
 * Now let's say you add twice a Single item:
 * inventory.addItem(singleTypeItem); // where item.qty = 1 and item.key = 'test'
 * inventory['test'] = singleTypeItem;
 * inventory.addItem(singleTypeItem); // where item.qty = 43 and still item.key = 'test'
 * inventory['test'] = singleTypeItem; // but here item.qty = 44.
 *
 * You can see how this singleInstance property affects the inventory behavior in /lib/item/inventory-model.js.
 *
 */

const ItemBase = require('./item-base');

class ItemSingle extends ItemBase
{

    constructor(props)
    {
        super(props);
        this.singleInstance = true;
    }

}

module.exports = ItemSingle;
