[![Reldens - GitHub - Release](https://www.dwdeveloper.com/media/reldens/reldens-mmorpg-platform.png)](https://github.com/damian-pastorini/reldens)

# Reldens - Items System

## About

**@reldens/items-system** is the items and inventory management system for Reldens. This package provides a comprehensive set of features for managing items, inventories, equipment, and item exchanges in game environments.

### Core Features

**Item Management:**
- Create and manage different item types (weapons, armor, consumables, quest items, etc.)
- Item modifiers and stats system
- Item properties (durability, quantity, requirements)
- Trade and sell values

**Inventory System:**
- Player inventory management
- Item storage and retrieval
- Inventory limits and organization
- Add / set / remove items
- Item quantity management
- Item groups with customizable limits

**Equipment System:**
- Equip/unequip items functionality
- Equipment validation
- Stat calculations with equipped items
- Multiple equipment slots support

**Item Types:**
- **ItemBase**: Base item class with core properties
- **ItemEquipment**: Items that can be equipped to provide stat bonuses
- **ItemUsable**: Consumable items with usage limits that apply modifiers
- **ItemSingle**: Single instance items (non-stackable)
- **ItemSingleEquipment**: Single instance equippable items
- **ItemSingleUsable**: Single instance usable items

**Exchange System:**
- Item trading between inventories
- Shop/merchant system
- Exchange requirements and validation
- Exchange rewards processing
- Requirements and rewards collections

**Advanced Features:**
- Event-driven architecture for inventory actions
- Client/server architecture with receiver and sender components
- Modifiers system (using @reldens/modifiers) for item effects
- Server authoritative validation
- Database-driven configuration
- Extensible architecture for custom item types

## Installation

```bash
npm install @reldens/items-system
```

## Usage

```javascript
const {
    ItemsManager,
    Inventory,
    ItemGroup,
    ItemBase,
    ItemEquipment,
    ItemUsable,
    ExchangePlatform
} = require('@reldens/items-system');

// Create an inventory
const inventory = new Inventory();

// Create items
const item = new ItemBase({ id: 1, key: 'potion', qty: 5 });

// Add items to inventory
inventory.addItem(item);

// Create item groups with limits
const weaponsGroup = new ItemGroup({ id: 1, key: 'weapons', limit: 10 });

// Use exchange platform for trading
const exchange = new ExchangePlatform();
```

## API

### Main Exports

- **ItemsServer**: Server-side items management
- **ItemsManager**: Core item management system
- **Inventory**: Inventory management
- **ItemGroup**: Item grouping and organization
- **ItemBase**: Base item class
- **ItemEquipment**: Equippable items
- **ItemUsable**: Usable/consumable items
- **ItemSingle**: Single instance items
- **ItemSingleEquipment**: Single instance equippable items
- **ItemSingleUsable**: Single instance usable items
- **ExchangePlatform**: Trading and exchange system
- **Receiver**: Client-side receiver for item updates
- **ItemsConst**: Constants used throughout the system
- **ItemsEvents**: Event types for item system
- **ItemsError**: Error handling

## Testing

```bash
npm test
```

---

Need something specific?

[Request a feature here: https://www.reldens.com/features-request](https://www.reldens.com/features-request)

## Documentation

[https://www.reldens.com/documentation/items-system](https://www.reldens.com/documentation/items-system)

---

### [Reldens](https://github.com/damian-pastorini/reldens/ "Reldens")

##### [By DwDeveloper](https://www.dwdeveloper.com/ "DwDeveloper")
