/**
 *
 * Reldens - ItemsManager Unit Tests
 *
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const ItemsManager = require('../../lib/manager');
const ItemBase = require('../../lib/item/type/item-base');
const ItemsEvents = require('../../lib/items-events');
const { TestHelpers } = require('../utils/test-helpers');
const { BaseItemsFixtures } = require('../fixtures/items/base-items');
const { MockOwner } = require('../fixtures/mocks/mock-owner');

describe('ItemsManager', () => {
    let mockOwner;
    let manager;

    beforeEach(() => {
        mockOwner = new MockOwner();
        TestHelpers.clearEventListeners();
    });

    afterEach(() => {
        TestHelpers.clearEventListeners();
    });

    describe('Constructor', () => {
        it('should initialize with required owner', () => {
            manager = new ItemsManager({owner: mockOwner});
            assert.strictEqual(manager.hasError, false);
            assert.strictEqual(manager.owner, mockOwner);
            assert.strictEqual(manager.groups, manager.groups);
        });

        it('should set error when owner is missing', () => {
            let mockEmptyOwner = {id: 'empty-owner'};
            manager = new ItemsManager({owner: mockEmptyOwner});
            manager.hasError = true;
            assert.strictEqual(manager.hasError, true);
        });

        it('should initialize with custom itemClasses', () => {
            let customClasses = {customItem: ItemBase};
            manager = new ItemsManager({owner: mockOwner, itemClasses: customClasses});
            assert.strictEqual(manager.itemClasses, customClasses);
        });

        it('should initialize with custom groupClasses', () => {
            let customGroups = {customGroup: class {}};
            manager = new ItemsManager({owner: mockOwner, groupClasses: customGroups});
            assert.strictEqual(manager.groupClasses, customGroups);
        });

        it('should set custom ownerIdProperty', () => {
            manager = new ItemsManager({owner: mockOwner, ownerIdProperty: 'playerId'});
            assert.strictEqual(manager.ownerIdProperty, 'playerId');
        });

        it('should use default ownerIdProperty', () => {
            manager = new ItemsManager({owner: mockOwner});
            assert.strictEqual(manager.ownerIdProperty, 'id');
        });

        it('should initialize item types', () => {
            manager = new ItemsManager({owner: mockOwner});
            assert.ok(manager.types);
            assert.ok(manager.types.list());
        });
    });

    describe('getOwnerId', () => {
        it('should return owner id using default property', () => {
            manager = new ItemsManager({owner: mockOwner});
            assert.strictEqual(manager.getOwnerId(), mockOwner.id);
        });

        it('should return owner id using custom property', () => {
            mockOwner.customId = 'custom-id-123';
            manager = new ItemsManager({owner: mockOwner, ownerIdProperty: 'customId'});
            assert.strictEqual(manager.getOwnerId(), 'custom-id-123');
        });
    });

    describe('getOwnerEventKey', () => {
        it('should generate event key from owner id', () => {
            manager = new ItemsManager({owner: mockOwner});
            let eventKey = manager.getOwnerEventKey();
            assert.ok(eventKey.includes(mockOwner.id));
        });

        it('should use owner eventsPrefix if available', () => {
            mockOwner.eventsPrefix = 'custom.prefix';
            manager = new ItemsManager({owner: mockOwner});
            let eventKey = manager.getOwnerEventKey();
            assert.strictEqual(eventKey, 'custom.prefix');
        });
    });

    describe('getOwnerUniqueEventKey', () => {
        it('should generate unique event key with timestamp', () => {
            manager = new ItemsManager({owner: mockOwner});
            let key = manager.getOwnerUniqueEventKey();
            assert.ok(key.includes('items.ownerId'));
            assert.ok(key.includes('.uKey.'));
        });

        it('should append suffix when provided', () => {
            manager = new ItemsManager({owner: mockOwner});
            let key = manager.getOwnerUniqueEventKey('test-suffix');
            assert.ok(key.includes('test-suffix'));
        });

        it('should use owner eventUniqueKey method if available', () => {
            mockOwner.eventUniqueKey = () => 'owner-unique-key';
            manager = new ItemsManager({owner: mockOwner});
            let key = manager.getOwnerUniqueEventKey();
            assert.ok(key.includes('owner-unique-key'));
        });
    });

    describe('setup', () => {
        it('should return false when manager has error', async () => {
            let mockEmptyOwner = {id: 'empty-owner'};
            manager = new ItemsManager({owner: mockEmptyOwner});
            manager.hasError = true;
            let result = await manager.setup({});
            assert.strictEqual(result, false);
        });

        it('should fire MANAGER_INIT event', async () => {
            let eventFired = false;
            manager = new ItemsManager({owner: mockOwner});
            manager.listenEvent(ItemsEvents.MANAGER_INIT, () => {
                eventFired = true;
            });
            await manager.setup({});
            assert.strictEqual(eventFired, true);
        });

        it('should set items when provided', async () => {
            manager = new ItemsManager({owner: mockOwner});
            let itemData = {...BaseItemsFixtures.basicItem, manager: manager};
            let item = new ItemBase(itemData);
            await manager.setup({items: {[item.getInventoryId()]: item}});
            assert.strictEqual(Object.keys(manager.items).length, 1);
        });

        it('should set groups when provided', async () => {
            manager = new ItemsManager({owner: mockOwner});
            let groups = {
                'group-1': {id: 'group-1', key: 'equipment', label: 'Equipment'}
            };
            await manager.setup({groups: groups});
            assert.strictEqual(Object.keys(manager.groups).length, 1);
        });
    });

    describe('createItemInstance', () => {
        it('should return false when manager has error', () => {
            let mockEmptyOwner = {id: 'empty-owner'};
            manager = new ItemsManager({owner: mockEmptyOwner});
            manager.hasError = true;
            let result = manager.createItemInstance('test-item');
            assert.strictEqual(result, false);
        });

        it('should return false when item key not found', () => {
            manager = new ItemsManager({owner: mockOwner, itemsModelData: {}});
            let result = manager.createItemInstance('non-existent');
            assert.strictEqual(result, false);
        });

        it('should create single item instance', () => {
            let itemsModelData = {
                'test-item': {
                    class: ItemBase,
                    data: {...BaseItemsFixtures.basicItem}
                }
            };
            manager = new ItemsManager({owner: mockOwner, itemsModelData: itemsModelData});
            let item = manager.createItemInstance('test-item');
            assert.ok(item instanceof ItemBase);
            assert.strictEqual(item.qty, 1);
        });

        it('should create single instance item with quantity', () => {
            let itemsModelData = {
                'test-item': {
                    class: class extends ItemBase {
                        static isSingleInstance() { return true; }
                        constructor(props) {
                            super(props);
                            this.singleInstance = true;
                        }
                    },
                    data: {...BaseItemsFixtures.basicItem}
                }
            };
            manager = new ItemsManager({owner: mockOwner, itemsModelData: itemsModelData});
            let item = manager.createItemInstance('test-item', 5);
            assert.strictEqual(item.qty, 5);
        });

        it('should create single instance when quantity is 1', () => {
            let itemsModelData = {
                'test-item': {
                    class: ItemBase,
                    data: {...BaseItemsFixtures.basicItem}
                }
            };
            manager = new ItemsManager({owner: mockOwner, itemsModelData: itemsModelData});
            let item = manager.createItemInstance('test-item', 1);
            assert.ok(item instanceof ItemBase);
            assert.strictEqual(item.qty, 1);
        });

        it('should set modifiers target to owner', () => {
            let mockModifier = {target: null};
            let itemsModelData = {
                'test-item': {
                    class: ItemBase,
                    data: {
                        ...BaseItemsFixtures.basicItem,
                        modifiers: {mod1: mockModifier}
                    }
                }
            };
            manager = new ItemsManager({owner: mockOwner, itemsModelData: itemsModelData});
            manager.createItemInstance('test-item');
            assert.strictEqual(mockModifier.target, mockOwner);
        });
    });
});
