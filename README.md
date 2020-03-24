[![Reldens - GitHub - Release](https://www.dwdeveloper.com/media/reldens/reldens-mmorpg-platform.png)](https://github.com/damian-pastorini/reldens)

# Reldens - Items System

## About

They idea behind this project is to cover the basics on how an inventory system work.
Using this package you will get the basic set of features and some more advance, for example, some basic features will be:
 - Manage the inventory add / set / remove items.
 - Modify items qty.
 - Have items groups.
 - Set limits per inventory, per items group, and per item itself.

And then you will get other more advanced features like:

- Implement it with different storage system, to manage the available items, modifiers, groups, persist and update the inventory status, etc.
- Implement it with different "clients" who will receive information about every inventory action.
- Listen to the inventory events to run your customize actions. 
- Possibility of use the available classes to create different item types, like an "equip" or "usable" items.
    - An "equip" item will check if the item was equipped in order to apply the item "modifiers".
    - An "usable" item that will apply the "modifiers" to the specified target as many times until reach the "uses" limit.
- Create "modifiers", these will be executed by the item and will affect the target properties, for example: a "modifier" could be: property = "hp", "action" = "increase proportion", value = "100%" and the item will be basically a health potion.

With the package I'll be including an SQL driver using Objection (since this is basically for the Reldens project, but ideally open for others), and a default client integrated with Colyseus.
  
@TODO: finish documentation.

## How to?

First install using npm: `npm install @reldens/items`

Once you have it you need to create an instance of the InventoryManager or the InventoryServer.

What's the difference?

- ItemsManager is the base set of features agnostic of the rest of the environment, you can instance the manager while working on a node project on the server side (use it as authority), or you can instance the manager for a single player game on the browser.

- ItemsServer is oriented to the server side, it includes the classes to connect with a database, and where you could set a client to send the inventory interactions.

In any case you will need to require and then instance the class by passing an "owner" to the constructor.

For the examples I'll use the server ItemsServer, since it's the more complex one and it includes the ItemsManager, and as owner I'll use a simple object with some properties.

```
let playerA = {
    stats: {
        maxHp: 100,
        maxMp: 100,
        atk: 100,
        def: 100
    }
    // these are the current HP and MP:
    hp: 50
    mp: 87
}

let playerB = {
    stats: {
        maxHp: 100,
        maxMp: 100,
        atk: 100,
        def: 100
    }
    // these are the current HP and MP:
    hp: 35
    mp: 80
}

const { ItemsServer } = require('@reldens/items');

let itemsServer = new ItemsServer(player);
```

And now you can start playing with Items! Let's create one!

#### - Usable Items

Create an item is as simple as create an instance of the Item class and that's it, but make do something is more complex, so to put some logic available here let's use the "modifiers".

What's a "modifier"??? Basically is an specification on "what the item will do" when is used, that said, thought the modifiers are available you could still not use them and create your item with a custom behavior.

- A modifier must have 4 required parameters, let's create an example one:
```
const { Modifier, ItemsConst } = require('@reldens/items');
let itemMod = {key: 'health', 'hp', ItemsConst.OPS.INC, 20};
```
- And then we add it to the item which we will create below:
```
const { ItemUsable } = require('@reldens/items');
let healthItem = new ItemUsable({
    key: 'health-restore',
    manager: itemServer.manager, // from the example above
    qty: 1,
    // uses: 1, // by default this is 1 already, just showing it can be specified here.
    modifiers: {health: itemMod}
});
```
- Now we can append the item to the player inventory:
```
itemServer.manager.addItem(healthItem);
```
- And we can use the item (in the case of ItemUsable we can specify the target as show below):
```
itemServer.manager.items['health-restore'].use(playerB);
```

That's it! The item will apply the created modifier and restore 20 HP's on the owner.hp property.

#### - Equipment Items

In order to equip an equipment item, you need to use a modifier for an specific owner property, and use the method SET.

For example:

- Your Player class could have a set of properties where you can specify the current equipment.
```
let player.equipSet = {
    weapon: false,
    shield: false,
    armor: false,
    boots: false
};
```
- Then you will have an item with two modifiers on for the property 'equipSet/weapon' and other for the atk increase:
```
const { Equipment, Modifier, ItemsConst } = require('@reldens/items');
let setSword = new Modifier({
    key: 'sword-equip',
    propertyKey: 'equipSet/weapon',
    operation: ItemsConst.OPS.SET,
    value: 'sword'
});
let modifyAtk = new Modifier({
    key: 'sword-atk',
    propertyKey: 'atk',
    operation: ItemsConst.OPS.INC,
    value: 200 // this would be the atk points increase
});
let swordItem = new Equipment({
    key: 'sword',
    manager: itemServer.manager,
    qty: 1,
    modifiers: {'sword-equip': setSword, 'sword-atk': modifyAtk}
});
```
- For last, you add the equip to the manager and equip the item:
```
itemsServer.manager.addItem(swordItem);
itemsServer.manager.items['sword'].equip();
```
- Let say you need to create a second item, an axe, for this you can duplicate the sword code and change the keys and
the atk property.  
```
let setAxe = new Modifier({
    key: 'axe-equip',
    propertyKey: 'equipSet/weapon',
    operation: ItemsConst.OPS.SET,
    value: 'axe'
});
let axeAtk = new Modifier({
    key: 'axe-atk',
    propertyKey: 'atk',
    operation: ItemsConst.OPS.INC,
    value: 500 // this would be the atk points increase
});
let axeItem = new Equipment({
    key: 'axe',
    manager: itemServer.manager,
    qty: 1,
    modifiers: {'axe-equip': setAxe, 'axe-atk': axeAtk}
});
itemsServer.manager.addItem(axeItem);
```
- But before equip the axe you will need to remove the sword (otherwise sword modifiers won't be reverted:
```
itemsServer.manager.items['sword'].unequip();
itemsServer.manager.items['axe'].equip();
```


### [Reldens](https://github.com/damian-pastorini/reldens/ "Reldens")

##### [By DwDeveloper](https://www.dwdeveloper.com/ "DwDeveloper")
