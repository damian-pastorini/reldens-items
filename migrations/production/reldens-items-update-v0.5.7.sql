#######################################################################################################################

SET FOREIGN_KEY_CHECKS = 0;

#######################################################################################################################

# Fixed modifiers table:

ALTER TABLE `items_item_modifiers` CHANGE COLUMN `operation` `operation` INT(11) NOT NULL COLLATE 'utf8_unicode_ci' AFTER `property_key`;

#######################################################################################################################

SET FOREIGN_KEY_CHECKS = 1;

#######################################################################################################################
