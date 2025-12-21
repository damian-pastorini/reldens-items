# Events and Error Codes Reference

Quick reference for all events and error codes in the items system.

## Events

All events are prefixed with `reldens.items.` by default.

### Manager Events

- `reldens.items.setup` - ItemsManager initialization complete
  - Payload: `{props, manager}`

### Inventory Events

- `reldens.items.validate` - Item validation
  - Payload: `inventory, item, validationResult`

- `reldens.items.addItemBefore` - Before adding item
  - Payload: `inventory, item`

- `reldens.items.addItem` - After adding item
  - Payload: `inventory, item`

- `reldens.items.removeItem` - Removing item
  - Payload: `inventory, itemKey`

- `reldens.items.modifyItemQty` - Quantity modified
  - Payload: `item, inventory, operation, key, qty`

- `reldens.items.setItems` - Items set
  - Payload: `{items, manager}`

- `reldens.items.setGroups` - Groups set
  - Payload: `{groups, manager}`

- `reldens.items.loadedOwnerItems` - Owner items loaded
  - Payload: varies

### Equipment Events

- `reldens.items.equipItem` - Item equipped
  - Payload: `item, target`

- `reldens.items.unequipItem` - Item unequipped
  - Payload: `item, target`

- `reldens.items.equipBeforeApplyModifiers` - Before applying modifiers
  - Payload: `item`

- `reldens.items.equipBeforeRevertModifiers` - Before reverting modifiers
  - Payload: `item`

- `reldens.items.equipAppliedModifiers` - After applying modifiers
  - Payload: `item`

- `reldens.items.equipRevertedModifiers` - After reverting modifiers
  - Payload: `item`

### Item Execution Events

- `reldens.items.executingItem` - Before item execution
  - Payload: `item, target`

- `reldens.items.executedItem` - After item execution
  - Payload: `item, target`

### Exchange Events

- `reldens.items.initialized` - Exchange initialized
  - Payload: `{exchangePlatform, props, inventoryA, inventoryB}`

- `reldens.items.canceled` - Exchange canceled
  - Payload: `{exchangePlatform}`

- `reldens.items.invalidPush` - Invalid item push attempt
  - Payload: `{exchangePlatform, itemUid, qty, inventoryKey}`

- `reldens.items.itemPushed` - Item successfully pushed
  - Payload: `{exchangePlatform, itemUid, qty, inventoryKey}`

- `reldens.items.itemRemove` - Item removed from exchange
  - Payload: `{exchangePlatform, itemUid, inventoryKey}`

- `reldens.items.confirm` - Exchange confirmed
  - Payload: `{exchangePlatform, inventoryKey}`

- `reldens.items.disconfirm` - Exchange disconfirmed
  - Payload: `{exchangePlatform, inventoryKey}`

- `reldens.items.beforeFinalize` - Before exchange finalization
  - Payload: `{exchangePlatform}`

- `reldens.items.finalized` - Exchange finalized
  - Payload: `{exchangePlatform}`

## Error Codes

All error codes are prefixed with `items.` by default.

### Inventory Error Codes

- `items.undefinedItem` - Item is undefined
- `items.undefinedMethodInventoryId` - Item missing getInventoryId() method
- `items.undefinedItemKey` - Item missing key property
- `items.invalidItemInstance` - Item instance failed validation
- `items.lockedForAddItem` - Inventory locked, cannot add item
- `items.maxTotalReachedForAddItem` - Maximum total items reached
- `items.itemExistsForAddItem` - Item already exists (non-single items)
- `items.itemLimitExceededForAddItem` - Item quantity exceeds limit
- `items.addItemsError` - Error adding items array
- `items.lockedForSetItem` - Inventory locked, cannot set item
- `items.lockedForRemoveItem` - Inventory locked, cannot remove item
- `items.keyNotFound` - Item key not found in inventory
- `items.lockedForModifyItemQty` - Inventory locked, cannot modify quantity
- `items.undefinedItemKeyForOperation` - Item key undefined for operation
- `items.qtyNotANumber` - Quantity is not a number
- `items.itemQtyLimitExceeded` - Item quantity limit exceeded
- `items.lockedForSetItems` - Inventory locked, cannot set items

### Exchange Error Codes

- `items.exchange.missingConfirmation` - Both parties must confirm exchange
- `items.exchange.invalidPushedQuantity` - Pushed quantity exceeds available quantity
- `items.exchange.invalidQuantity` - Invalid quantity (e.g., 0)
- `items.exchange.invalidExchange` - Invalid exchange (FROM and TO are same)
- `items.exchange.decreaseQuantity` - Failed to decrease item quantity
- `items.exchange.itemAdd` - Failed to add item to inventory

### Requirements Error Codes

- `items.requirements.itemNotPresent` - Required item not present in inventory
- `items.requirements.quantityNotAvailable` - Required quantity not available
- `items.requirements.itemNotPushed` - Required item not pushed for exchange
- `items.requirements.itemQuantityNotPushed` - Required quantity not pushed
- `items.requirements.itemDoesNotExists` - Required item doesn't exist
- `items.requirements.itemAdd` - Failed to add requirement item

### Rewards Error Codes

- `items.reward.doesNotExists` - Reward doesn't exist
- `items.reward.missingItem` - Reward item missing
- `items.reward.itemNotPresent` - Reward item not present
- `items.reward.quantityNotAvailable` - Reward quantity not available
- `items.reward.missingPushed` - Missing pushed items for reward
- `items.reward.getItemDoesNotExists` - Get item doesn't exist
- `items.reward.processItem` - Failed to process reward item
- `items.reward.processInventory` - Failed to process reward inventory
- `items.reward.addItems` - Failed to add reward items
- `items.reward.quantityOverload` - Reward quantity exceeds limits

### Equipment Error Codes

- `items.equipment.modifiersApply` - Failed to apply equipment modifiers
- `items.equipment.modifiersRevert` - Failed to revert equipment modifiers

## Action Constants

Used for client/server communication.

- `rinvA` - Add item action
- `rinvR` - Remove item action
- `rinvM` - Modify quantity action
- `rinvE` - Equip item action
- `rinvU` - Unequip item action
- `rinvMa` - Modifier applied action
- `rinvMr` - Modifier reverted action
- `rinvEx` - Executing item action
- `rinvAExd` - Item executed action
- `rinvMi` - Manager initialized action
- `rinvSi` - Set items action
- `rinvSg` - Set groups action

## Item Type Constants

- `10` - ITEM_BASE - Base item type
- `1` - EQUIPMENT - Equipment items
- `2` - USABLE - Usable/consumable items
- `3` - SINGLE - Single-instance items (stackable)
- `4` - SINGLE_EQUIPMENT - Single-instance equipment
- `5` - SINGLE_USABLE - Single-instance usable

## Trade Action Constants

- `buy` - Buy action
- `sell` - Sell action
- `trade` - Trade action

## Communication Behavior Constants

- `send` - Send to specific client
- `broadcast` - Broadcast to all clients
- `both` - Both send and broadcast

## Common Error Handling Pattern

```javascript
let result = await inventory.addItem(item);
if(false === result){
    let error = inventory.lastError;
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Error Data:', error.data);
    if(error.error){
        console.error('Nested Error:', error.error);
    }
}
```

## Event Listening Pattern

```javascript
itemsManager.listenEvent(
    ItemsEvents.ADD_ITEM,
    (inventory, item) => {
        console.log('Item added:', item.key);
    },
    'unique-listener-key'
);
```

## Custom Events with Prefix

When creating ItemGroup or using custom eventsPrefix:

```javascript
let group = new ItemGroup({
    id: 1,
    key: 'equipment',
    eventsPrefix: 'player123.'
});

// Events will be: player123.g.equipment.reldens.items.addItem
// Format: {playerPrefix}.g.{groupKey}.{eventName}
```

## Event Propagation

1. Item events bubble up through manager
2. Manager events can be global or owner-specific
3. Exchange events are platform-specific
4. All events go through EventsManager (from @reldens/utils)

## Error Context

Errors include contextual data in the `data` property:

```javascript
{
    code: 'items.itemLimitExceededForAddItem',
    message: 'Cannot add item, item qty limit exceeded.',
    data: {
        itemUid: 'sword_abc123',
        qty: 150
    }
}
```

Common data fields:
- `itemUid` - Item unique ID
- `qty` - Quantity involved
- `operation` - Operation type (set, increase, decrease)
- `limitPerItem` - Limit that was exceeded
- `confirmations` - Confirmation status (exchange)
