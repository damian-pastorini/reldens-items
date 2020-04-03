
const { ErrorManager } = require('@reldens/utils');
const ItemsConst = require('../constants');
const ItemsEvents = require('../items-events');

class ClientSender
{

    constructor(manager, client = false)
    {
        if(!client){
            ErrorManager.error('Undefined client for Observer.');
        }
        this.manager = manager;
        this.client = client;
    }

    listenEvents()
    {
        this.manager.events.on(ItemsEvents.ADD_ITEM, async (inventory, item) => {
            await this.client.send({act: ItemsConst.ACTION_ADD, item: {key: item.key, qty: item.qty}});
        });
        this.manager.events.on(ItemsEvents.REMOVE_ITEM, async (inventory, item) => {
            await this.client.send({act: ItemsConst.ACTION_REMOVE, key: item.key});
        });
        this.manager.events.on(ItemsEvents.MODIFY_ITEM_QTY, async (item, op, key, qty) => {
            await this.client.send({act: ItemsConst.ACTION_MODIFY_QTY, item: {key: item.key, qty: item.qty}});
        });
        this.manager.events.on(ItemsEvents.EQUIP_ITEM, async (item) => {
            await this.client.send({act: ItemsConst.ACTION_EQUIP, key: item.key});
        });
        this.manager.events.on(ItemsEvents.UNEQUIP_ITEM, async (item) => {
            await this.client.send({act: ItemsConst.ACTION_UNEQUIP, key: item.key});
        });
        // @NOTE: check Item class changeModifiers method.
        this.manager.events.on(ItemsEvents.EQUIP+'AppliedModifiers', async (item) => {
            await this.client.send({act: ItemsConst.ACTION_MOD_APPLIED, key: item.key});
        });
        this.manager.events.on(ItemsEvents.EQUIP+'RevertedModifiers', async (item) => {
            await this.client.send({act: ItemsConst.ACTION_MOD_REVERTED, key: item.key});
        });
        this.manager.events.on(ItemsEvents.EXECUTING_ITEM, async (inventory, item) => {
            await this.client.send({act: ItemsConst.ACTION_EXECUTING, key: item.key});
        });
        this.manager.events.on(ItemsEvents.EXECUTED_ITEM, async (inventory, item) => {
            await this.client.send({act: ItemsConst.ACTION_EXECUTED, key: item.key});
        });
    }

}

module.exports.ClientObserver = ClientSender;
