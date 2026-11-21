/**
 *
 * Reldens - GroupsDataGenerator
 *
 * This class will use a list of classes and a groups models list to generate the proper instances for each case.
 * This is outside and unrelated to the server storage space, because even if you don't use a storage you could still
 * create your models manually, populate them with the proper data and get your classes instances with this generator.
 * appendGroup adds a new or edited group model to already mapped groups: the model with the same id is replaced in
 * groupModels and an edited key removes the entries of the previous key.
 *
 */

const ItemGroup = require('./item/group');
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
        if(!sc.isArray(groups.groupModels)){
            groups.groupModels = [];
        }
        groups.groupList = sc.get(groups, 'groupList', {});
        groups.groupBaseData = sc.get(groups, 'groupBaseData', {});
        let previousGroupModel = groups.groupModels.find(group => group?.id === groupModel.id);
        if(previousGroupModel && previousGroupModel.key !== groupModel.key){
            delete groups.groupList[previousGroupModel.key];
            delete groups.groupBaseData[previousGroupModel.key];
        }
        groups.groupModels = groups.groupModels.filter(group => group?.id !== groupModel.id);
        groups.groupModels.push(groupModel);
        this.addGroup(groupModel, groups, inventoryClasses);
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
