/// <reference path="../task.js" />
/// <reference path="tasks.store.js" />

/**
 * @class
 * The state of the permissions part of the Tasks page
 */
class PermissionsStore { 

    /**
     * @param {TasksStore} tasksStore
     */
    constructor(tasksStore) { 
        // initialze all fields here
        this.permissionLinkList = [];

        this.tasksStore = tasksStore
    }

    get permissionLinks() { 
        return this.permissionLinkList;
    }

    /**
     * Sets this store's permission links
     * @param {PermissionLink[]} permissionLinks 
     */
    set permissionLinks(permissionLinks) { 
        this.permissionLinkList = permissionLinks;
    }



}

mobx.decorate(PermissionsStore, {
    permissionLinks : mobx.computed
})