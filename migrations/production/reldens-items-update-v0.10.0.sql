#######################################################################################################################

SET FOREIGN_KEY_CHECKS = 0;

#######################################################################################################################

# Items group images:

ALTER TABLE `items_group` ADD COLUMN `files_name` TEXT NULL DEFAULT NULL AFTER `description`;

# Items table new fields:

ALTER TABLE `items_item`
	ADD COLUMN `type` INT(10) NOT NULL DEFAULT '0' AFTER `key`,
	ADD COLUMN `customData` TEXT NULL AFTER `execTimeOut`;

#######################################################################################################################

SET FOREIGN_KEY_CHECKS = 1;

#######################################################################################################################
