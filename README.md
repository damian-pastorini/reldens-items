[![Reldens - GitHub - Release](https://www.dwdeveloper.com/media/reldens/reldens-mmorpg-platform.png)](https://github.com/damian-pastorini/reldens)

# Reldens - Items System

## About

The idea behind this project is to cover the basics on how an inventory system work.
Using this package you will get the basic set of features and some more advance, for example:
 - Manage the inventory add / set / remove items.
 - Modify items qty.
 - Have items groups.
 - Set limits per inventory, per items group, and per item itself.

And then you will get other more advanced features like:

- Implement it with different storage system, to manage the available items, modifiers, groups, persist and update the
inventory status, etc.
- Implement it with different "clients" who will receive information about every inventory action.
- Listen to the inventory events to run your customize actions. 
- Possibility of use the available classes to create different item types, like an "equip" or "usable" items.
    - An "equip" item will check if the item was equipped in order to apply the item "modifiers".
    - A "usable" item that will apply the "modifiers" to the specified target as many times until reach the "uses"
limit.
- Create "modifiers", which will be executed by the item and will affect the target properties, for example: a
"modifier" could be: property = "hp", "action" = "increase proportion", value = "100%" and the item will be basically
a health potion.
- Items exchange between inventories to create a "shop" or just "trade" items.

---

Need something specific?

[Request a feature here: https://www.reldens.com/features-request](https://www.reldens.com/features-request)

## Documentation

[https://www.reldens.com/documentation/items-system](https://www.reldens.com/documentation/items-system)

---

### [Reldens](https://github.com/damian-pastorini/reldens/ "Reldens")

##### [By DwDeveloper](https://www.dwdeveloper.com/ "DwDeveloper")
