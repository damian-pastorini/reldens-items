
const { ModelsManager } = require('./models-manager');

class Observer
{

    constructor(manager, modelsManager = false)
    {
        this.manager = manager;
        if(modelsManager){
            this.modelsManager = modelsManager;
        } else {
            this.modelsManager = new ModelsManager();
        }
    }

    listenEvents()
    {
        this.manager.events.on('reldens.addItem', async (inventory, item) => {
            await this.modelsManager.onAddItem(inventory, item);
        });
        this.manager.events.on('reldens.removeItem', async (inventory, item) => {
            await this.modelsManager.onRemoveItem(inventory, item);
        });
        this.manager.events.on('reldens.modifyItemQty', async (inventory, item) => {
            await this.modelsManager.onModifyItemQty(inventory, item);
        });
        this.manager.events.on('reldens.equipItem', async (inventory, item) => {
            await this.modelsManager.onEquipItem(inventory, item);
        });
        this.manager.events.on('reldens.unequipItem', async (inventory, item) => {
            await this.modelsManager.onUnequipItem(inventory, item);
        });
        this.manager.events.on('reldens.equipAppliedModifiers', async (inventory, item) => {
            await this.modelsManager.onEquipAppliedModifiers(inventory, item);
        });
        this.manager.events.on('reldens.executeItem', async (inventory, item) => {
            await this.modelsManager.onExecuteItem(inventory, item);
        });
    }

}

module.exports.Observer = Observer;
