
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

        // pay rates stuff
        this.payRateIndex = -1;

        this._dateString = '';

        this.payRateIndicesToDelete = [];


        mobx.autorun(() => {
            // set the state of the other data stores from here
            if (this.currentTask){ 
                console.log("reacted")


            }

            console.log(this.report)
        })
      
        // our reaction to a task index change should be to reset the pay rate index to 0
        mobx.reaction(() => this.taskIndex,
                     (taskIndex) => { 
                        console.log("task index changed")
                        this.payRateIndex = 0
                      })
    }

    // getters
    get report() { 
        return `
this.tasks === ${this.tasks}
this.payRates === ${this.payRates}`
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

    // actions

    /**
     * Adds a task
     * @param {TaskObject} task
     */
    addTask(task) { 
        this.tasks.push(Object.assign(task, { _added : true }));
        this.taskIndex = this.tasks.length - 1
    }

    /**
     * Removes a task
     * @param {number} index
     */
    removeTaskAt(index) { 
        // find the task 
        let foundTask = this.tasks[index]

        if (foundTask) {
            // if the task there is _added
            if (foundTask._added) {
                // splice it out
                this.tasks.splice(this.taskIndex, 1)
                // if taskIndex is now out-of-bounds, put it back in bounds
                if (this.taskIndex >= this.tasks.length) { 
                    this.taskIndex = this.tasks.length - 1
                }
            }
            // otherwise, mark it _deleted
            else { 
                this.tasks[index]._deleted = true
            }
        }

    }

    revertTaskChangesAt(index) { 
        this.tasks[index].RevertChanges()


    }

    get payRates() { 
        if (this.currentTask) { 
            return this.currentTask.Payrates
        }
        return []
    }

    get currentPayRate() { 
        if ((this.payRates) && (this.payRates.length)) {
            return this.payRates[this.payRateIndex];
        }
        return new PayRate();
    }

    get dateString() { 
        if (!this._dateString) { 
            if (this.currentPayRate) { 
                return this.currentPayRate.GetReadableDate()
            }
            return "";
        }
        return this._dateString;
    }

    set dateString(str) { 
        this._dateString = str;
    }

    /**
     * Checks for duplicates
     * @param { PayRate } newPayRate
     * @returns whether or not there's pay rates dated the same as this
     */
    checkForDuplicates(newPayRate) { 
        // if there's no effective date to compare, we're done
        if (!newPayRate.EffectiveDate) { 
            return false;
        }

        // extract the date from newPayRate
        const date = newPayRate.GetReadableDate()

        // for all the pay rates on the list
        for (let idx in this.payRates) {
            const payrate = this.payRates[idx]
            // if we found one whose date matches, we're done here
            if ((payrate.GetReadableDate() === date) && 
                (this.payRateIndex != idx)
            ) {
                return true;
            }
        }
        return false;
    }

    // actions
    /**
     * Adds a PayRate
     * @param {PayRate} payRate 
     */
    addNewPayRate(payRate) { 
        this.payRates.push(Object.assign(payRate, { _added : true }))
        this.payRateIndex = this.payRates.length - 1
        this.dateString = this.payRates[this.payRateIndex].GetReadableDate()
    }

    /**
     * Updates PayRate in the list of payRates
     * @param {number} index 
     * @param {PayRate} newPayRate 
     */
    updatePayRateAt(index = -1, newPayRate) { 
        const payRatesCount = this.payRates.length;

        if (index === -1) { 
            this.addNewPayRate(newPayRate);
            return;
        }

        if ((index >= payRatesCount) || (index < 0)) { 
            throw RangeError('index must correspond to the list of payrates')
        }

        this.payRates = this.getUpdatedPayRateList(index, newPayRate);

    }

    updateCurrentPayRate(newPayRate) { 
        let currentTask = this.tasks[this.taskIndex]
        let {Payrates} = currentTask
        Payrates[this.payRateIndex] = newPayRate
    }

    updateCurrentPayRateDate(dateString) { 
      this.dateString = dateString
      
      let currentTask = this.tasks[this.taskIndex]
      let {Payrates} = currentTask
      Payrates[this.payRateIndex].EffectiveDate = new Date(dateString)
    }

    updateCurrentPayRateAmount(amount) { 
      let currentTask = this.tasks[this.taskIndex]
      let {Payrates} = currentTask
      Payrates[this.payRateIndex].Rate = Number(amount)
      
    }

    /**
     * Removes a payRate at index
     * @param {number} index 
     */
    removePayRateAt(index) {
        // if this payrate has been _added, actually remove it
        let foundPayRate = this.payRates[index]
        if (foundPayRate._added) { 
            this.payRates.splice(index, 1)
        }
        // otherwise, mark it deleted
        else { 
            this.payRates[index]._deleted = true
        }
    }

    /**
     * Undo removal of PayRate
     * @param {number} index 
     */
    undoRemovePayRateAt(index) { 
        // if it is marked _deleted, revert that
        let foundPayRate = this.payRates[index]
        if (foundPayRate._deleted) {
            delete this.payRates[index]._deleted
        }
    }

    saveTasks() { 
        // TODO: what should be done here !?
    }

    

}

/* decorating the class; // have to do it this way because decorator syntax is in ES.next, which hasn't released yet. Also, I cannot seem to get it via Babel CDN link */
mobx.decorate(TasksStore, {
    tasks : mobx.observable,
    taskIndex : mobx.observable,
    taskId : mobx.observable,
    report : mobx.computed,
    tasksHaveChanged : mobx.computed,
    addTask : mobx.action,
    removeTaskAt : mobx.action, 
    revertTaskChangesAt : mobx.action,
    currentTask : mobx.computed,
    // pay rates stuff
    payRates : mobx.computed,
    payRateIndex : mobx.observable,
    payRateIndicesToDelete : mobx.observable,
    _dateString : mobx.observable, 
    dateString : mobx.computed, 
    currentPayRate : mobx.computed,
    addNewPayRate : mobx.action.bound,
    updatePayRateAt : mobx.action,
    updateCurrentPayRate : mobx.action.bound,
    updateCurrentPayRateDate : mobx.action.bound,
    updateCurrentPayRateAmount : mobx.action.bound,
    removePayRateAt : mobx.action.bound,
    undoRemovePayRateAt : mobx.action.bound
})    
