
# Missing key on modifiers table:

ALTER TABLE `items_item_modifiers` ADD COLUMN `key` VARCHAR(255) NOT NULL AFTER `item_id`;
ALTER TABLE `items_item_modifiers` ADD COLUMN `maxProperty` VARCHAR(255) NULL DEFAULT NULL AFTER `value`;

INSERT INTO `items_item_modifiers` (`id`, `item_id`, `key`, `property_key`, `operation`, `value`, `maxProperty`) VALUES (1, 4, 'atk', 'stats/atk', '5', '5', NULL);
INSERT INTO `items_item_modifiers` (`id`, `item_id`, `key`, `property_key`, `operation`, `value`, `maxProperty`) VALUES (3, 5, 'atk', 'stats/atk', '5', '3', NULL);
INSERT INTO `items_item_modifiers` (`id`, `item_id`, `key`, `property_key`, `operation`, `value`, `maxProperty`) VALUES (2, 3, 'heal_potion_20', 'stats/hp', '1', '20', 'initialStats/hp');
