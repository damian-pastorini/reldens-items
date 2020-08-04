
# Fixed modifiers table:

ALTER TABLE `items_item_modifiers` CHANGE COLUMN `operation` `operation` INT(11) NOT NULL COLLATE 'utf8_unicode_ci' AFTER `property_key`;
