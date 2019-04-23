/// <reference path="../task.js" />

/**
 * @class
 * The state of the entire tasks page
 */
class TasksStore { 

    // this is part of what was done here: https://mobx.js.org/refguide/computed-decorator.html#computeds-with-arguments
    _tasksCache = new Map();
    _taskIndexCache = new Map();

    constructor() { 
        // initialize all fields here
        /**
         * @member {TaskObject[]} tasks
         */
        this.tasks = [];
        /**
         * @member {number}
         */
        this.taskIndex = -1;

        // initialize the stores in the constructor
        // this came from here : https://mobx.js.org/best/store.html
        this.payRatesStore = new PayRatesStore(this);
        this.permissionLinksStore = new PermissionsStore(this);

        mobx.autorun(() => {
            // set the state of the other data stores from here
            if (this.currentTask){ 
                // setting the state of the pay rates store
                this.payRatesStore.payRates = this.currentTask.Payrates
                this.payRatesStore.payRateIndex = 0
                // setting the state of the permission links store
                this.permissionLinksStore.permissionLinkList = this.currentTask.PermissionLinks
              
                console.log("view binding logic should happen here, on view elements that are purposefully omitted")

            }

        })
    }

    // getters
    get report() { 
        return `this.tasks === ${this.tasks}`
    }

    get tasksHaveChanged() { 
        return this.tasks.reduce((accumulator, currentTask) => { 
            return ((accumulator) || (currentTask.IsChanged()))
        }, false)
    }

    /**
     * @return {TaskObject} the current task
     */
    get currentTask() { 
        return this.tasks[this.taskIndex]
    }

    /**
     * @param {TaskObject} newTask
     */
    set currentTask(newTask) { 
        // look up the index of newTask in the list of tasks
        const index = this.indexOf(newTask)
        // update this.taskIndex
        this.taskIndex = index
    }

    // TODO: Should we, and if so, how, to mark this method computed (Mobx cannot mark arg-taking functions as @computed)
    /**
     * Returns the index of task with respect to this list of tasks
     * @param {TaskObject} task 
     */
    indexOf(task) { 
        // Implementation for this is inspired by https://mobx.js.org/refguide/computed-decorator.html#computeds-with-arguments
        const id = task.Model.Id
        if (this._taskIndexCache.has(id)) { 
            return this._taskIndexCache.get(id).get()
        }
        
        const computedFind = mobx.computed(() => this.tasks.findIndex((val) => (JSON.stringify(val) === JSON.stringify(task))))
        this._taskIndexCache.set(id, computedFind)
        return computedFind.get()
    }

    /**
     * Returns the index of task with respect to this list of tasks
     * @param {TaskObject} task 
     * @return {TaskObject} the task, if found, or undefined
     */
    find(task) { 
        // Implementation for this is inspired by https://mobx.js.org/refguide/computed-decorator.html#computeds-with-arguments
        const id = task.Model.Id
        if (this._tasksCache.has(id)) { 
            return this._tasksCache.get(id).get()
        }

        const computedFind = mobx.computed(() => this.tasks.find((val) => (JSON.stringify(val) === JSON.stringify(task))))
        this._tasksCache.set(id, computedFind)
        return computedFind.get()
    }

    // actions

    /**
     * Sets current task to the last one
     */
    moveToLastTask() { 
        this.taskIndex = this.tasks.length - 1
    }

    /**
     * Adds a task
     * @param {TaskObject} task
     */
    addTask(task) { 
        this.tasks.push(Object.assign(task, { _added : true }));
    }

    /**
     * Removes a task
     * @param {TaskObject} task
     */
    removeTask(task) { 
        // find the task 
        let foundTask = this.find(task)

        if (foundTask) {
            // if the task there is _added
            if (foundTask._added) {
                // splice it out
                this.tasks.splice(taskIndex, 1)
            }
            // otherwise, mark it _deleted
            else { 
                task._deleted = true
            }
        }

    }

    revertTaskChanges(task) { 
        // find the task
        let foundTask = this.find(task)

        if (foundTask) { 
            // revert back to state of OriginalObject
            Object.assign(foundTask, foundTask.OriginalObject)
        }


    }

    saveTasks() { 
        // TODO: what should be done here !?
    }

    

}

/* decorating the class; // have to do it this way because decorator syntax is in ES.next, which hasn't released yet. Also, I cannot seem to get it via Babel CDN link */
mobx.decorate(TasksStore, {
    tasks : mobx.observable,
    report : mobx.computed,
    taskIndex : mobx.observable,
    tasksHaveChanged : mobx.computed,
    moveToLastTask : mobx.action,
    addTask : mobx.action,
    removeTask : mobx.action, 
    revertTaskChanges : mobx.action,
    currentTask : mobx.computed,
    payRatesStore : mobx.observable
})    

// any helper functions
