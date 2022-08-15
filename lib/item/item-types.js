/**
 *
 * Reldens - Items System - ItemTypes
 *
 */

const ItemsConst = require('../constants');
const ItemBase = require('./type/item-base');
const ItemEquipment = require('./type/equipment');
const Usable = require('./type/usable');
const ItemSingle = require('./type/single');
const SingleEquipment = require('./type/single-equipment');
const SingleUsable = require('./type/single-usable');
const { sc } = require('@reldens/utils');

class ItemTypes
{

    constructor()
    {
        this.types = {};
        this.types[ItemsConst.TYPES.ITEM_BASE] = ItemBase;
        this.types[ItemsConst.TYPES.EQUIPMENT] = ItemEquipment;
        this.types[ItemsConst.TYPES.USABLE] = Usable;
        this.types[ItemsConst.TYPES.SINGLE] = ItemSingle;
        this.types[ItemsConst.TYPES.SINGLE_EQUIPMENT] = SingleEquipment;
        this.types[ItemsConst.TYPES.SINGLE_USABLE] = SingleUsable;
    }

    list()
    {
        return this.types;
    }

    classByTypeId(typeId)
    {
        return sc.get(this.types, typeId.toString(), ItemBase);
    }

}

module.exports = ItemTypes;
