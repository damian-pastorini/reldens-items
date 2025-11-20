# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

**@reldens/items-system** is the items and inventory management system for Reldens. It provides:
- Item management (creation, modification, deletion)
- Inventory system (player inventories, storage)
- Equipment system (equip/unequip items)
- Item types (weapons, armor, consumables, etc.)
- Item modifiers and stats
- Trading system
- Item drops and rewards

## Key Commands

```bash
# Run tests
npm test
```

## Architecture

### Core Classes

**ItemsManager**:
- Manages all items in the game
- Handles item creation and configuration
- Processes item effects and modifiers

**Inventory**:
- Player inventory management
- Item storage and retrieval
- Inventory limits and organization

**Item**:
- Base item class
- Contains item properties (type, stats, modifiers)
- Usable/equippable logic

**ItemTypes**:
- Weapon items
- Armor items
- Consumable items
- Quest items
- Miscellaneous items

### Item System Components

**Item Properties**:
- Base stats (damage, defense, etc.)
- Modifiers (stat bonuses, effects)
- Requirements (level, class, etc.)
- Durability and quantity
- Trade/sell values

**Equipment System**:
- Equipment slots
- Equip/unequip validation
- Stat calculations with equipped items
- Visual representation

## Important Notes

- Items are database-driven - configured via admin panel
- Uses @reldens/modifiers for item effects and bonuses
- Server authoritative - all item operations validated on server
- Client receives item data and displays UI
- Integrated with main Reldens platform inventory system
- Entities previously in this package now in main platform
