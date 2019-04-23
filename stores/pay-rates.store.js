/// <reference path="../task.js" />
/// <reference path="../../payrate/payrate.js" />
/// <reference path="tasks.store.js" />

/**
 * @class
 * The state of the pay rates
 */
class PayRatesStore { 

    
    _payRatesCache = new Map();

    /**
     * @param {TasksStore} tasksStore
     */
    constructor(tasksStore) { 
        // initialize all fields here
        /**
         * @field {PayRate[]}
         */
        this.payRates = [];

        this.payRateIndex = -1;

        this._dateString = '';

        /**
         * @field {number[]}
         */
        this.payRateIndicesToDelete = [];


        this.tasksStore = tasksStore

        mobx.autorun(() => { 
            // if the payrates have changed, emit those changes back to tasksStore
            if (this.payRatesHaveChanged) { 
                // make sure that the pay rates here and in tasks store are different before changing them
                if (this.payRates !== this.tasksStore.currentTask.Payrates) {

                    const taskIndex = this.tasksStore.taskIndex
    
                    this.tasksStore.tasks[taskIndex] = Object.assign(new TaskObject(), 
                        this.tasksStore.currentTask, 
                        { Payrates : this.payRates })
                }
            }
        })


    }


    // getters
    get currentPayRate() { 
        if ((this.payRates) && (this.payRates.length)) {
            return this.payRates[this.payRateIndex];
        }
        return new PayRate();
    }

    set currentPayRate(newPayRate) { 
        this.payRates[this.payRateIndex] = newPayRate;
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
     * Have pay rates changed (from this store)?
     */
    get payRatesHaveChanged() {
        // if the current task isn't defined yet, there's no changes (stores haven't all loaded yet)
        if (!this.tasksStore.currentTask) { 
            return false;
        }
        // if this has payRates and the current task is different than the task this.payRates is for, there is no change
        if ((this.payRates.length) && 
            (this.tasksStore.currentTask.Model.Id !== this.payRates[0].TaskId)) { 
            return false;
        }
        // if the number of payrates has increased from that in the tasksStore, pay rates have changed
        if (this.payRates.length > this.tasksStore.currentTask.Payrates.length) { 
            return true;
        }
        // otherwise, go through all the Payrates
        return this.payRates.reduce((accumulator, payRate) => { 
            return accumulator || payRate.IsChanged()
        }, false)
    }

    /**
     * Returns the index of payRate with respect to this list of PayRates
     * @param {PayRate} payRate 
     * @return {PayRate} the payRate, if found, or undefined
     */
    find(payRate) { 
        const stringID = `storeID:${payRate.StoreId};empID:${payRate.EmpId};taskID:${payRate.TaskId}`
        // Implementation for this is inspired by https://mobx.js.org/refguide/computed-decorator.html#computeds-with-arguments
        if (this._payRatesCache.has(stringID)) { 
            return this._payRatesCache.get(stringID).get()
        }
        const computedFind = mobx.computed(() => this.payRates.find((val) => (JSON.stringify(val) === JSON.stringify(payRate))))
        this._payRatesCache.set(stringID, computedFind)
        return computedFind.get()
    }

    /**
     * Gets the list of payrates 
     * @param {number} index 
     * @param {PayRate} newPayRate 
     * @returns {PayRate[]} list of payrates, after applying update
     */
    getUpdatedPayRateList(index = -1, newPayRate) { 
        const payRates = this.payRates,
            payRatesCount = payRates.length;
        
        if (index === -1) { 
            return payRates.concat(newPayRate)
        } 
        
        if ((index >= payRatesCount) || (index < 0)) { 
            throw RangeError('index must correspond to the list of payrates')
        }
        
        let listOfPayRates = [
            ...payRates.slice(0, index),
            newPayRate,
            ...payRates.slice(index + 1)
        ]

        return listOfPayRates
    }

    // validation logic
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
        this.dateString = this.payRates[this.payRates.length - 1].GetReadableDate()
    }

    /**
     * Edits the current PayRate
     * @param {PayRate} payRate 
     * @deprecated This may not be necessary. Just update the PayRate from the caller!
     */
    editPayRate(payRate) { 
        this.currentPayRate = payRate
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
            delete foundPayRate._deleted
        }
    }



}

mobx.decorate(PayRatesStore, {
    payRates : mobx.observable,
    payRateIndex : mobx.observable,
    payRateIndicesToDelete : mobx.observable,
    _dateString : mobx.observable, // TODO: Should this be computed?
    dateString : mobx.computed, // TODO: Should this be computed?
    currentPayRate : mobx.computed,
    payRatesHaveChanged : mobx.computed,
    addNewPayRate : mobx.action,
    editPayRate : mobx.action,
    updatePayRateAt : mobx.action,
    removePayRateAt : mobx.action,
    undoRemovePayRateAt : mobx.action
})