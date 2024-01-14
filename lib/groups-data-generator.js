/**
 *
 * Reldens - GroupsDataGenerator
 *
 * This class will use a list of classes and a groups models list to generate the proper instances for each case.
 * This is outside and unrelated to the server storage space, because even if you don't use a storage you could still
 * create your models manually, populate them with the proper data and get your classes instances with this generator.
 *
 */

const { ItemGroup } = require('./item/group');
const { sc } = require('@reldens/utils');

class GroupsDataGenerator
{

    static groupsListMappedData(inventoryClasses, groupModelsList)
    {
        if(0 === groupModelsList.length){
            return {};
        }
        let groups = {groupList: {}, groupBaseData: {}};
        groups.groupModels = groupModelsList;
        for(let groupModel of groupModelsList){
            this.addGroup(groupModel, groups, inventoryClasses);
        }
        return groups;
    }

    static appendGroup(groupModel, groups, inventoryClasses)
    {
        if(!groupModel || !groups || !inventoryClasses){
            return false;
        }
        if(!sc.isArray(groups.groupModelsList)){
            groups.groupModelsList = [];
        }
        groups.groupModelsList.push(groupModel);
        this.addGroup(inventoryClasses, groupModel, groups)
        return groups;
    }

    static addGroup(groupModel, groups, inventoryClasses)
    {
        let groupClass = sc.get(inventoryClasses, groupModel.key, ItemGroup);
        let {id, key, label, description, sort, files_name} = groupModel;
        groups.groupList[groupModel.key] = {class: groupClass, data: groupModel};
        groups.groupBaseData[key] = {id, key, label, description, sort, files_name};
    }

}

module.exports = GroupsDataGenerator;
