#######################################################################################################################

SET FOREIGN_KEY_CHECKS = 0;

#######################################################################################################################

# Items group images:

ALTER TABLE `items_group` ADD COLUMN `files_name` TEXT NULL DEFAULT NULL AFTER `description`;

#######################################################################################################################

SET FOREIGN_KEY_CHECKS = 1;

#######################################################################################################################
