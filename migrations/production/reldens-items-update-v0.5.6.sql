
# Missing key on modifiers table:

ALTER TABLE `items_item_modifiers` ADD COLUMN `key` VARCHAR(255) NOT NULL AFTER `item_id`;
ALTER TABLE `items_item_modifiers` ADD COLUMN `maxProperty` VARCHAR(255) NULL DEFAULT NULL AFTER `value`;
