## Package Overview

**@reldens/items-system** (v0.45.0) is a comprehensive items and inventory management system for Reldens. It provides:
- Inventory management (add/remove items, quantity control, limits)
- Item type system (base, single, equipment, usable, and combinations)
- Item groups (categorized inventories with separate limits)
- Exchange/trading platform (player-to-player, NPC trading, buying/selling)
- Item modifiers system (stat bonuses, effects via @reldens/modifiers)
- Client/Server communication (Sender/Receiver pattern)
- Events system for extensibility
- Comprehensive error handling

## Key Commands

```bash
# Run tests
npm test
```

## Architecture

### Core Classes

**ItemsServer** (`lib/server.js`):
- Server-side package wrapper
- Combines ItemsManager with Sender for client communication
- Entry point for server-side item management

**ItemsManager** (`lib/manager.js`):
- Extends Inventory class with advanced features
- Creates item instances from model data
- Manages item groups
- Handles owner-specific events
- Uses @reldens/modifiers for item effects

**Inventory** (`lib/item/inventory.js`):
- Core inventory functionality
- Add/remove items with validation
- Quantity modification (set, increase, decrease)
- Inventory locking mechanism
- Item limits (total items, per-item quantity)
- Event-driven architecture
- Error tracking via ItemsError

**ItemGroup** (`lib/item/group.js`):
- Extends Inventory for categorized item storage
- Separate limits per group
- Use cases: equipment bags, consumables bag, quest items, etc.

### Item Type Hierarchy

**ItemBase** (`lib/item/type/item-base.js`):
- Base class for all items
- Properties: key, uid, id, item_id, label, description, qty, modifiers
- Modifier application/reversion
- Event handling
- Custom data support

**ItemSingle** (`lib/item/type/single.js`):
- Single-instance items (quantity grouped in one inventory slot)
- Example: stackable items like potions, arrows

**ItemEquipment** (`lib/item/type/equipment.js`):
- Equippable items with modifier support
- Equip/unequip functionality
- Automatic modifier application on equip

**Usable** (`lib/item/type/usable.js`):
- Consumable/usable items
- Execute functionality for item usage

**SingleEquipment** (`lib/item/type/single-equipment.js`):
- Combination of Single + Equipment
- Stackable equippable items

**SingleUsable** (`lib/item/type/single-usable.js`):
- Combination of Single + Usable
- Stackable consumable items

### Item Growth

**ItemGrowthLeveler** (`lib/item/growth/item-growth-leveler.js`):
- Grows the items with a `growth` custom data with the experience gained by their owner
- `initializeItem()` with the stored level and experience, `addOwnerExperience()` on every experience gained
- A level up unequips an equipped item, scales its modifiers, fires `GROWTH_LEVEL_UP` and `UPDATE_ITEM` and equips it
  again; `GROWTH_EXPERIENCE_ADDED` follows every experience added (the integration persists the growth there)
- The experience added to the same item runs in order (the experience received during a level up is never lost); a
  failed step is stored as the manager `lastError` (`items.growth.stepFailed`): a failed unequip stops the level up, the
  failed listeners never stop the equip again

**ItemGrowthCalculator** (`lib/item/growth/item-growth-calculator.js`):
- Experience share, reached level and scaled modifier value (`ItemsConst.GROWTH`)

**ItemTypes** (`lib/item/item-types.js`):
- Registry of item type classes
- Type ID to class mapping
- Type constants: ITEM_BASE (10), EQUIPMENT (1), USABLE (2), SINGLE (3), SINGLE_EQUIPMENT (4), SINGLE_USABLE (5)

### Exchange System

**ExchangePlatform** (`lib/exchange/exchange-platform.js`):
- Trading between two inventories (A and B)
- Locks inventories during exchange
- Confirmation system (both parties must confirm)
- Requirements and rewards processing
- Drop exchange mode (e.g., selling to NPC without them receiving the item)
- Comprehensive validation before finalization

**RequirementsCollection** + **RequirementsProcessor**:
- Define what items are required for exchange
- Validate requirements are met
- Process requirement removal on exchange

**RewardsCollection** + **RewardsProcessor**:
- Define what items are given as rewards
- Validate rewards can be given
- Process reward addition on exchange

**ExchangeRequirement** + **ExchangeReward**:
- Individual requirement/reward items
- Quantity and validation logic

### Client/Server Communication

**Sender** (`lib/server/sender.js`):
- Server-side message sender
- Sends item updates to client
- Event-driven communication
- `UPDATE_ITEM` sends `ACTION_UPDATE` with the configured properties of an existing item

**Receiver** (`lib/client/receiver.js`):
- Client-side message receiver
- Processes server item updates
- Updates client-side state
- `ACTION_UPDATE` updates the existing client item (`ItemBase.updateProperties()`) and fires `UPDATE_ITEM`
- `processMessage()` awaits the action method and returns its result; a failed action is logged and stored in
  `recieveErrorsLog` under its method name, and it returns false

### Data Generators

**ItemsDataGenerator** (`lib/items-data-generator.js`):
- Generates item data structures
- Prepares items for manager initialization
- Processes item modifiers from `itemModel.related_items_item_modifiers` relation
- Converts modifier data to Modifier instances indexed by modifier ID
- Automatically converts numeric values for non-set operations

**GroupsDataGenerator** (`lib/groups-data-generator.js`):
- Generates group data structures
- Prepares groups for manager initialization

### Supporting Classes

**ModelEntity** (`lib/item/model-entity.js`):
- Database model wrapper for items
- Bridges ORM entities with item system

**ItemsError** (`lib/items-error.js`):
- Custom error class for items system
- Error codes and structured error data

**ItemsEvents** (`lib/items-events.js`):
- Event name constants
- Events: MANAGER_INIT, ADD_ITEM, REMOVE_ITEM, MODIFY_ITEM_QTY, EQUIP_ITEM, UNEQUIP_ITEM, UPDATE_ITEM, GROWTH_LEVEL_UP,
  GROWTH_EXPERIENCE_ADDED, EXCHANGE events, etc.

**Constants** (`lib/constants.js`):
- Item type constants
- Action constants
- Error code constants
- Trade action constants (BUY, SELL, TRADE)

## Additional Documentation

For detailed technical documentation, see:
- **`.claude/architecture.md`** - Complete class hierarchy, methods, properties, usage patterns
- **`.claude/events-and-errors.md`** - Events catalog, error codes reference, constants

## Important Notes

- **Items entities** have been extracted and integrated in the main Reldens platform under `D:\dap\work\reldens\src\lib\inventory\server`
- **Relation keys pattern**: Item modifiers use `related_items_item_modifiers` property (follows Reldens `related_*` prefix convention for database relations)
- Items are database-driven - configured via admin panel
- Uses **@reldens/modifiers** package for item effects and stat bonuses
- Uses **@reldens/utils** package for helpers (Shortcuts, Logger, EventsManager)
- Server authoritative - all item operations validated on server
- Event-driven architecture allows extensive customization
- Supports single-instance items (stackable) and unique-instance items
- Inventory locking prevents concurrent modifications during exchanges
- Comprehensive error handling with specific error codes for debugging
