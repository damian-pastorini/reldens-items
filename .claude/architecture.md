# Items System - Detailed Architecture

This document provides in-depth technical documentation for the @reldens/items-system package.

## Class Hierarchy

```
ItemsServer
  ├── ItemsManager (extends Inventory)
  │   └── uses ItemTypes
  └── Sender

Inventory
  ├── ItemsManager
  └── ItemGroup

ItemBase
  ├── ItemSingle
  ├── ItemEquipment
  ├── Usable
  ├── SingleEquipment (extends ItemSingle + Equipment behavior)
  └── SingleUsable (extends ItemSingle + Usable behavior)

ExchangePlatform
  ├── RequirementsProcessor
  │   └── RequirementsCollection
  │       └── ExchangeRequirement[]
  └── RewardsProcessor
      └── RewardsCollection
          └── ExchangeReward[]
```

## Core Classes Detail

### ItemsServer (`lib/server.js`)

Entry point for server-side item management. Wraps ItemsManager and Sender together.

**Constructor Props:**
- `owner` (required) - The entity that owns this items system
- `client` (optional) - Client connection for sending updates
- All ItemsManager props

**Properties:**
- `manager` - ItemsManager instance
- `client` - Sender instance (if client provided)
- `hasError` - Boolean flag for initialization errors

**Usage:**
```javascript
let itemsServer = new ItemsServer({
    owner: player,
    client: playerClient,
    itemClasses: {...},
    itemsModelData: {...}
});
```

### ItemsManager (`lib/manager.js`)

Extends Inventory with advanced features for managing items with model data.

**Constructor Props:**
- `owner` (required) - Owner entity
- `itemClasses` - Map of item key to item class
- `groupClasses` - Map of group configurations
- `itemsModelData` - Item model data from database
- `ownerIdProperty` - Property name for owner ID (default: 'id')
- `eventsPrefix` - Prefix for event names
- All Inventory props

**Properties:**
- `owner` - Owner entity reference
- `groups` - Object containing ItemGroup instances
- `types` - ItemTypes instance
- `eventsPrefix` - Event name prefix
- Inherits all Inventory properties

**Key Methods:**
- `setup(props)` - Async initialization with items and groups
- `createItemInstance(key, qty)` - Creates item instance(s) from model data
- `getOwnerId()` - Returns owner ID
- `getOwnerEventKey()` - Returns owner-specific event key
- `getOwnerUniqueEventKey(suffix)` - Returns unique event key with timestamp

**Events Fired:**
- `MANAGER_INIT` - On setup completion

### Inventory (`lib/item/inventory.js`)

Core inventory management with add/remove/modify operations.

**Constructor Props:**
- `eventsManager` - EventsManager instance (default: EventsManagerSingleton)
- `limitPerItem` - Max quantity per item (-1 = disabled)
- `itemsLimit` - Max total items (-1 = disabled)
- `applyModifiersAuto` - Auto-apply modifiers (default: true)
- `revertModifiersAuto` - Auto-revert modifiers (default: true)
- `eventsPrefix` - Event name prefix

**Properties:**
- `items` - Object containing item instances (key: inventoryId)
- `limitPerItem` - Quantity limit per item
- `itemsLimit` - Total items limit
- `locked` - Boolean, prevents modifications when true
- `lastError` - Last ItemsError instance
- `frozenItems` - Temporary item storage during exchanges

**Key Methods:**
- `validate(item)` - Async validation of item instance
- `addItem(item)` - Async add item with validation
- `addItems(itemsArray)` - Async add multiple items
- `removeItem(key)` - Async remove item by key
- `setItemQty(key, qty)` - Set item quantity
- `increaseItemQty(key, qty)` - Increase item quantity
- `decreaseItemQty(key, qty)` - Decrease item quantity
- `modifyItemQty(op, key, qty)` - Generic quantity modifier
- `setItems(items)` - Replace all items
- `setGroups(groups)` - Set groups object
- `findItemByKey(itemKey)` - Find item by key property
- `findItemsByPropertyValue(propertyKey, propertyValue)` - Find items by any property
- `fireEvent(eventName, ...args)` - Emit event
- `listenEvent(eventName, callback, removeKey, masterKey)` - Listen to event

**Events Fired:**
- `VALIDATE` - On item validation
- `ADD_ITEM_BEFORE` - Before adding item
- `ADD_ITEM` - After adding item
- `REMOVE_ITEM` - On removing item
- `MODIFY_ITEM_QTY` - On quantity modification
- `SET_ITEMS` - On setting items
- `SET_GROUPS` - On setting groups

**Error Codes:**
- `UNDEFINED_ITEM` - Item is undefined
- `UNDEFINED_METHOD_INVENTORY_ID` - Item missing getInventoryId method
- `UNDEFINED_ITEM_KEY` - Item missing key property
- `INVALID_ITEM_INSTANCE` - Item failed validation
- `LOCKED_FOR_ADD_ITEM` - Inventory locked, cannot add
- `MAX_TOTAL_REACHED_FOR_ADD_ITEM` - Items limit reached
- `ITEM_EXISTS_FOR_ADD_ITEM` - Item already exists (non-single items)
- `ITEM_LIMIT_EXCEEDED_FOR_ADD_ITEM` - Quantity exceeds limit
- `LOCKED_FOR_SET_ITEM` - Inventory locked, cannot set
- `LOCKED_FOR_REMOVE_ITEM` - Inventory locked, cannot remove
- `KEY_NOT_FOUND` - Item key not found
- `LOCKED_FOR_MODIFY_ITEM_QTY` - Inventory locked, cannot modify quantity
- `UNDEFINED_ITEM_KEY_FOR_OPERATION` - Missing item key for operation
- `QTY_NOT_A_NUMBER` - Quantity is not a number
- `ITEM_QTY_LIMIT_EXCEEDED` - Quantity exceeds per-item limit
- `LOCKED_FOR_SET_ITEMS` - Inventory locked, cannot set items

### ItemGroup (`lib/item/group.js`)

Extends Inventory for categorized item storage with separate limits.

**Constructor Props:**
- `id` (required) - Group ID
- `key` (required) - Group key
- `label` - Display label
- `description` - Group description
- `files_name` - Associated file name (e.g., for icons)
- `sort` - Sort order
- `items_limit` - Max items in this group
- `limit_per_item` - Max quantity per item in this group
- All Inventory props

**Properties:**
- All Inventory properties
- `id` - Group database ID
- `key` - Group unique key
- `label` - Display name
- `description` - Group description
- `files_name` - Icon/image file name
- `sort` - Sort order for display

**Use Cases:**
- Equipment bag (weapons, armor)
- Consumables bag (potions, food)
- Quest items bag
- Material storage
- Currency pouch
- Any categorized inventory with separate limits

## Item Type Classes

### ItemBase (`lib/item/type/item-base.js`)

Base class for all item types. Contains core properties and modifier handling.

**Constructor Props:**
- `key` (required) - Item type key
- `manager` (required) - ItemsManager instance
- `uid` - Unique instance ID (auto-generated if not provided)
- `id` - Inventory item instance ID (database)
- `item_id` - Item type ID (database)
- `label` - Display name
- `description` - Item description
- `type` - Item type constant
- `qty` - Item quantity
- `remaining_uses` - Remaining uses for consumables
- `is_active` - Active state (e.g., equipped)
- `group_id` - Associated group ID
- `qty_limit` - Quantity limit for this item
- `uses_limit` - Uses limit for this item
- `autoRemoveItemOnZeroQty` - Auto-remove when qty reaches 0 (default: true)
- `useTimeOut` - Timeout for use action
- `execTimeOut` - Timeout for execute action
- `modifiers` - Object of modifier instances
- `customData` - Custom data object (JSON or object)

**Properties:**
- `key` - Item type identifier
- `uid` - Unique instance identifier
- `id` - Database instance ID
- `item_id` - Database type ID
- `label` - Display name
- `description` - Description text
- `manager` - ItemsManager reference
- `type` - Type constant
- `qty` - Quantity
- `remaining_uses` - Uses remaining
- `is_active` - Active state
- `group_id` - Group association
- `qty_limit` - Max quantity
- `uses_limit` - Max uses
- `autoRemoveItemOnZeroQty` - Auto-remove flag
- `useTimeOut` - Use timeout value
- `execTimeOut` - Execute timeout value
- `modifiers` - Modifiers object
- `target` - Target entity for modifiers
- `singleInstance` - Single instance flag (default: false)
- `rawCustomData` - Raw custom data
- Custom properties from customData

**Key Methods:**
- `static isSingleInstance()` - Returns false (overridden in Single types)
- `getInventoryId()` - Returns key (single) or uid (unique)
- `applyModifiers()` - Async apply all modifiers to target
- `revertModifiers()` - Async revert all modifiers from target
- `changeModifiers(revert)` - Generic modifier change method
- `isType(type)` - Check if item is specific type
- `fireEvent(eventName, ...args)` - Fire event through manager
- `listenEvent(eventName, callback, removeKey, masterKey)` - Listen to event

**Events Fired:**
- `EQUIP_BEFORE+ApplyModifiers` - Before applying modifiers
- `EQUIP_BEFORE+RevertModifiers` - Before reverting modifiers
- `EQUIP+AppliedModifiers` - After applying modifiers
- `EQUIP+RevertedModifiers` - After reverting modifiers

### ItemSingle (`lib/item/type/single.js`)

Single-instance items where quantity is grouped in one inventory slot.

**Key Differences:**
- `static isSingleInstance()` - Returns true
- `singleInstance` property set to true in constructor
- Uses `key` as inventory ID instead of `uid`
- Multiple items with same key share one inventory slot

**Use Cases:**
- Stackable potions
- Arrows/ammunition
- Crafting materials
- Currency

### ItemEquipment (`lib/item/type/equipment.js`)

Equippable items that can apply/revert modifiers.

**Additional Methods:**
- `async equip(target, applyModifiers)` - Equip item to target
- `async unequip(target, revertModifiers)` - Unequip item from target

**Events Fired:**
- `EQUIP_ITEM` - On equip
- `UNEQUIP_ITEM` - On unequip

**Use Cases:**
- Weapons
- Armor
- Accessories
- Equipment that modifies stats

### Usable (`lib/item/type/usable.js`)

Consumable/usable items with execute functionality.

**Additional Methods:**
- `async execute(target)` - Execute item usage
- Custom execution logic can be added via modifiers or events

**Events Fired:**
- `EXECUTING_ITEM` - Before execution
- `EXECUTED_ITEM` - After execution

**Use Cases:**
- Health potions
- Mana potions
- Food items
- Scrolls
- One-time use items

### SingleEquipment (`lib/item/type/single-equipment.js`)

Combination of Single and Equipment behaviors. Stackable equippable items.

**Characteristics:**
- Single instance (stackable)
- Equippable
- Modifiers apply/revert

**Use Cases:**
- Stackable armor pieces
- Stackable weapons (rare but possible)
- Ammo that provides bonuses when equipped

### SingleUsable (`lib/item/type/single-usable.js`)

Combination of Single and Usable behaviors. Stackable consumable items.

**Characteristics:**
- Single instance (stackable)
- Usable/consumable
- Execute functionality

**Use Cases:**
- Stacked potions
- Stacked food items
- Stacked scrolls
- Any stackable consumable

### ItemTypes (`lib/item/item-types.js`)

Registry mapping type IDs to item classes.

**Type Constants:**
- `ITEM_BASE: 10` - Base item type
- `EQUIPMENT: 1` - Equipment items
- `USABLE: 2` - Usable/consumable items
- `SINGLE: 3` - Single-instance items
- `SINGLE_EQUIPMENT: 4` - Single-instance equipment
- `SINGLE_USABLE: 5` - Single-instance usable

**Methods:**
- `list()` - Returns all types object
- `classByTypeId(typeId)` - Returns class for type ID (defaults to ItemBase)

## Exchange System

### ExchangePlatform (`lib/exchange/exchange-platform.js`)

Trading/exchange system between two inventories.

**Constructor Props:**
- `eventsManager` - EventsManager instance
- `exchangeInitializerId` - Unique ID for this exchange

**Methods:**
- `initializeExchangeBetween(props)` - Initialize exchange
  - `inventoryA` (required) - First inventory
  - `inventoryB` (required) - Second inventory
  - `exchangeRequirementsA` - Requirements for A
  - `exchangeRequirementsB` - Requirements for B
  - `exchangeRewardsA` - Rewards for A
  - `exchangeRewardsB` - Rewards for B
  - `dropExchangeA` - Don't add items to A (e.g., NPC selling)
  - `dropExchangeB` - Don't add items to B
  - `avoidExchangeDecreaseA` - Don't decrease items from A
  - `avoidExchangeDecreaseB` - Don't decrease items from B
- `async pushForExchange(itemUid, qty, inventoryKey)` - Add item to exchange
- `async removeFromExchange(itemUid, inventoryKey)` - Remove item from exchange
- `async confirmExchange(inventoryKey)` - Confirm exchange for inventory
- `async disconfirmExchange(inventoryKey)` - Unconfirm exchange
- `async finalizeExchange()` - Execute the exchange
- `cancelExchange()` - Cancel and reset exchange
- `validateRequirements(inventoryKey)` - Validate requirements
- `validateRewards(inventoryKey)` - Validate rewards
- `lockInventories()` - Lock both inventories
- `unlockInventories()` - Unlock both inventories

**Exchange Flow:**
1. `initializeExchangeBetween()` - Setup inventories
2. `pushForExchange()` - Both parties add items
3. `confirmExchange()` - Both parties confirm
4. `finalizeExchange()` - Execute exchange if both confirmed
5. Inventories unlocked, exchange reset

**Events Fired:**
- `EXCHANGE.INITIALIZED` - On initialization
- `EXCHANGE.CANCELED` - On cancellation
- `EXCHANGE.INVALID_PUSH` - On invalid push attempt
- `EXCHANGE.ITEM_PUSHED` - On successful item push
- `EXCHANGE.ITEM_REMOVE` - On item removal
- `EXCHANGE.CONFIRM` - On confirmation
- `EXCHANGE.DISCONFIRM` - On disconfirmation
- `EXCHANGE.BEFORE_FINALIZE` - Before finalization
- `EXCHANGE.FINALIZED` - After successful finalization

**Error Codes:**
- `EXCHANGE.MISSING_CONFIRMATION` - Both parties must confirm
- `EXCHANGE.INVALID_PUSHED_QUANTITY` - Quantity exceeds available
- `EXCHANGE.INVALID_QUANTITY` - Invalid quantity (e.g., 0)
- `EXCHANGE.INVALID_EXCHANGE` - From and To are same
- `EXCHANGE.DECREASE_QUANTITY` - Failed to decrease quantity
- `EXCHANGE.ITEM_ADD` - Failed to add item

### Requirements System

**ExchangeRequirement** - Individual requirement item
**RequirementsCollection** - Collection of requirements
**RequirementsProcessor** - Validates and processes requirements

Requirements define what items must be present or traded for an exchange to complete.

**Validation:**
- Item exists in inventory
- Quantity available
- Item pushed for exchange (if required)

**Processing:**
- Remove non-exchanged required items
- Validate before removal

**Error Codes:**
- `REQUIREMENTS.ITEM_NOT_PRESENT` - Required item missing
- `REQUIREMENTS.QUANTITY_NOT_AVAILABLE` - Insufficient quantity
- `REQUIREMENTS.ITEM_NOT_PUSHED` - Required item not in exchange
- `REQUIREMENTS.ITEM_QUANTITY_NOT_PUSHED` - Insufficient quantity pushed
- `REQUIREMENTS.ITEM_DOES_NOT_EXISTS` - Item doesn't exist
- `REQUIREMENTS.ITEM_ADD` - Failed to add requirement item

### Rewards System

**ExchangeReward** - Individual reward item
**RewardsCollection** - Collection of rewards
**RewardsProcessor** - Validates and processes rewards

Rewards define what items are given as part of an exchange.

**Validation:**
- Reward exists in system
- Can be added to inventory

**Processing:**
- Add reward items to receiving inventory
- Create item instances

**Error Codes:**
- `REWARD.DOES_NOT_EXISTS` - Reward doesn't exist
- `REWARD.MISSING_ITEM` - Reward item missing
- `REWARD.ITEM_NOT_PRESENT` - Item not present
- `REWARD.QUANTITY_NOT_AVAILABLE` - Quantity not available
- `REWARD.MISSING_PUSHED` - Missing pushed items
- `REWARD.GET_ITEM_DOES_NOT_EXISTS` - Item doesn't exist
- `REWARD.PROCESS_ITEM` - Failed to process item
- `REWARD.PROCESS_INVENTORY` - Failed to process inventory
- `REWARD.ADD_ITEMS` - Failed to add items
- `REWARD.QUANTITY_OVERLOAD` - Quantity exceeds limits

## Communication

### Sender (`lib/server/sender.js`)

Server-side message sender for client updates.

**Constructor Props:**
- `manager` - ItemsManager instance
- `client` - Client connection

**Functionality:**
- Listens to manager events
- Sends item updates to client
- Formats messages for client consumption

### Receiver (`lib/client/receiver.js`)

Client-side message receiver for server updates.

**Functionality:**
- Receives item updates from server
- Updates client-side item state
- Triggers client-side events

## Data Generators

### ItemsDataGenerator (`lib/items-data-generator.js`)

Generates item data structures from raw data (typically database entities).

**Methods:**
- `static itemsListMappedData(inventoryClasses, itemsModelsList)` - Maps item models to class/data structures
- `static generateItemModifiers(itemModel)` - Converts modifier data to Modifier instances

**Functionality:**
- Transforms database items to item class instances
- Prepares item model data for ItemsManager
- Maps item keys to classes
- Processes item modifiers from `itemModel.related_items_item_modifiers` relation
- Converts modifier data to Modifier instances indexed by modifier ID
- Automatically converts numeric string values to numbers for non-set operations
- Falls back to type-based classes when custom classes not found

**Important:**
- Uses `related_items_item_modifiers` property (Reldens relation key pattern with `related_*` prefix)
- Modifiers are indexed by their ID in the returned object
- Numeric values are automatically converted for operations other than SET

### GroupsDataGenerator (`lib/groups-data-generator.js`)

Generates group data structures from raw data.

**Methods:**
- `static groupsListMappedData(inventoryClasses, groupsModelsList)` - Maps group models to structures
- `static addGroup(groupModel, groups, inventoryClasses)` - Adds individual group to collection

**Functionality:**
- Transforms database groups to ItemGroup instances
- Prepares group configurations
- Maps group keys to instances
- Creates groupList, groupBaseData, and groupModels collections
- Uses custom group classes when provided

## Supporting Classes

### ModelEntity (`lib/item/model-entity.js`)

Database model wrapper for items. Bridges ORM entities with the items system.

**Functionality:**
- Wraps database entity
- Provides item-system-compatible interface
- Handles entity-to-item transformation

### ItemsError (`lib/items-error.js`)

Custom error class for structured error handling.

**Constructor:**
- `message` - Error message
- `code` - Error code constant
- `data` - Additional error data
- `withError` - Nested error object

**Properties:**
- `message` - Error message
- `code` - Error code
- `data` - Error data
- `error` - Nested error (if provided)

### ItemsEvents (`lib/items-events.js`)

Event name constants for the entire system.

**Event Categories:**
- Manager events (MANAGER_INIT)
- Inventory events (ADD_ITEM, REMOVE_ITEM, MODIFY_ITEM_QTY, SET_ITEMS, SET_GROUPS)
- Equipment events (EQUIP_ITEM, UNEQUIP_ITEM, EQUIP_BEFORE, EQUIP)
- Exchange events (INITIALIZED, CANCELED, ITEM_PUSHED, ITEM_REMOVE, CONFIRM, FINALIZED, etc.)
- Item execution events (EXECUTING_ITEM, EXECUTED_ITEM)
- Validation events (VALIDATE)

### Constants (`lib/constants.js`)

System-wide constants.

**Categories:**
- `SET, INCREASE, DECREASE` - Quantity operations
- `ACTIONS_PREF` - Action prefix for messages
- `ACTION_*` - Action constants for client communication
- `BEHAVIOR_*` - Communication behaviors (SEND, BROADCAST, BOTH)
- `TYPES` - Item type constants
- `TRADE_ACTIONS` - Trade action types (BUY, SELL, TRADE)
- `ERROR_CODES` - Complete error code registry

## Common Patterns

### Creating an ItemsManager

```javascript
const ItemsManager = require('@reldens/items-system/lib/manager');

let itemsManager = new ItemsManager({
    owner: player,
    itemClasses: {
        'health_potion': HealthPotionClass,
        'sword': SwordClass
    },
    itemsModelData: {
        'health_potion': {
            class: SingleUsable,
            data: {key: 'health_potion', label: 'Health Potion', qty: 10}
        },
        'sword': {
            class: ItemEquipment,
            data: {key: 'sword', label: 'Iron Sword', qty: 1}
        }
    },
    limitPerItem: 99,
    itemsLimit: 50
});

await itemsManager.setup({
    items: {...},
    groups: {...}
});
```

### Adding Items

```javascript
let potion = itemsManager.createItemInstance('health_potion', 5);
await itemsManager.addItem(potion);
```

### Setting Up an Exchange

```javascript
const ExchangePlatform = require('@reldens/items-system/lib/exchange/exchange-platform');

let exchange = new ExchangePlatform({});
exchange.initializeExchangeBetween({
    inventoryA: player1.itemsManager,
    inventoryB: player2.itemsManager
});

await exchange.pushForExchange(itemUid, 1, 'A');
await exchange.confirmExchange('A');
await exchange.confirmExchange('B');
await exchange.finalizeExchange();
```

### Using Item Groups

```javascript
const ItemGroup = require('@reldens/items-system/lib/item/group');

let equipmentBag = new ItemGroup({
    id: 1,
    key: 'equipment',
    label: 'Equipment',
    items_limit: 20,
    limit_per_item: 1
});

await equipmentBag.addItem(sword);
```

## Integration with Reldens Platform

- Items entities are defined in main platform: `D:\dap\work\reldens\src\lib\inventory\server`
- This package provides the runtime item management
- Database models are loaded from main platform
- Events integrate with platform EventsManager
- Modifiers integrate with @reldens/modifiers package
- Utils use @reldens/utils package (Shortcuts, Logger, EventsManager)
