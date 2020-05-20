-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               5.7.26 - MySQL Community Server (GPL)
-- Server OS:                    Win64
-- HeidiSQL Version:             9.5.0.5196
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for table reldens.items_group
CREATE TABLE IF NOT EXISTS `items_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `items_limit` int(1) NOT NULL DEFAULT '0',
  `limit_per_item` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='The group table is to save the groups settings.';

-- Dumping data for table reldens.items_group: ~0 rows (approximately)
/*!40000 ALTER TABLE `items_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `items_group` ENABLE KEYS */;

-- Dumping structure for table reldens.items_inventory
CREATE TABLE IF NOT EXISTS `items_inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `item_qty` int(11) NOT NULL,
  `remaining_uses` int(11) NOT NULL,
  `is_active` int(1) NOT NULL COMMENT 'For example equipped or not equipped items.',
  PRIMARY KEY (`id`),
  KEY `FK_items_inventory_items_item` (`item_id`),
  CONSTRAINT `FK_items_inventory_items_item` FOREIGN KEY (`item_id`) REFERENCES `items_item` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Inventory table is to save the items for each owner.';

-- Dumping data for table reldens.items_inventory: ~0 rows (approximately)
/*!40000 ALTER TABLE `items_inventory` DISABLE KEYS */;
/*!40000 ALTER TABLE `items_inventory` ENABLE KEYS */;

-- Dumping structure for table reldens.items_item
CREATE TABLE IF NOT EXISTS `items_item` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `group_id` int(11) NOT NULL,
  `label` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `qty_limit` int(11) NOT NULL DEFAULT '0' COMMENT 'Default 0 to unlimited qty.',
  `uses_limit` int(11) NOT NULL DEFAULT '1' COMMENT 'Default 1 use per item (0 = unlimited).',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `key` (`key`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `FK_items_item_items_group` FOREIGN KEY (`group_id`) REFERENCES `items_group` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='List of all available items in the system.';

-- Dumping data for table reldens.items_item: ~0 rows (approximately)
/*!40000 ALTER TABLE `items_item` DISABLE KEYS */;
/*!40000 ALTER TABLE `items_item` ENABLE KEYS */;

-- Dumping structure for table reldens.items_item_modifiers
CREATE TABLE IF NOT EXISTS `items_item_modifiers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `property_key` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `operation` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `value` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `FK_items_item_modifiers_items_item` FOREIGN KEY (`item_id`) REFERENCES `items_item` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Modifiers is the way we will affect the item owner.';

-- Dumping data for table reldens.items_item_modifiers: ~0 rows (approximately)
/*!40000 ALTER TABLE `items_item_modifiers` DISABLE KEYS */;
/*!40000 ALTER TABLE `items_item_modifiers` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
