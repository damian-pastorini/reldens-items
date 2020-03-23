[![Reldens - GitHub - Release](https://www.dwdeveloper.com/media/reldens/reldens-mmorpg-platform.png)](https://github.com/damian-pastorini/reldens)

# Reldens - Items System

### About

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

### [Reldens](https://github.com/damian-pastorini/reldens/ "Reldens")

##### [By DwDeveloper](https://www.dwdeveloper.com/ "DwDeveloper")
