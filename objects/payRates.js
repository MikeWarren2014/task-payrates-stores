class PayRate {
  /**
   * @param {number} storeId The store id of the pay rate. (-1 for all)
   * @param {number} empId The id of the employee. (-1 for all)
   * @param {number} taskId The id of the task. (-1 for all)
   * @param {Date} effectiveDate The date the payrate goes in effect.
   * @param {number} rate The rate of pay.
   */
  constructor(storeId, empId, taskId, effectiveDate, rate) {
    this.StoreId = storeId || -1;
    this.EmpId = empId || -1;
    this.TaskId = taskId || -1;
    this.EffectiveDate = effectiveDate ? new Date(effectiveDate) : new Date();
    this.Rate = rate || 0.00;
    this.OriginalObject = Object.assign({}, this);
  }

  /**
   * Gets a readable version of the effective date.
   * @returns {string} A -m/dd/yyyy representation of the effective date.
   */
  GetReadableDate() {
    return this.EffectiveDate.toLocaleDateString("en-US");
  }
  /**
   * Gets a one line description of the pay rate.
   * @returns {string} A string in the form of (date) - payrate.
   */
  GetDescription() {
    return `(${this.GetReadableDate()}) - $${this.Rate.toFixed(2)}`;
  }
  /**
   * Gets a one line description of the pay rate.
   * Does the exact same as GetDescription(), but is overload of Object.prototype.toString, which allows for stringification of Objects
   * @returns {string} A string in the form of (date) - payrate.
   */
  toString() {
    return `(${this.GetReadableDate()}) - $${this.Rate.toFixed(2)}`;
  }
  /**
   * Tells whether a pay rate was changed or not.
   * @returns {boolean} A boolean saying whether or not the pay rate was changed.
   */
  IsChanged() {
    if (this.EffectiveDate.getTime() !== this.OriginalObject.EffectiveDate.getTime()) {
      return true;
    }
    if (this.Rate != this.OriginalObject.Rate) {
      return true;
    }
    if (this._deleted) {
      return true;
    }
    return false;
  }
  /**
   * Reverts the changes back to the original.
   */
  RevertChanges() {
    Object.assign(this, this.OriginalObject);
  }
}

// mobx decorations
if (typeof(mobx) !== "undefined") {
  mobx.decorate(PayRate, {
    StoreId : mobx.observable,
    EmpId : mobx.observable,
    TaskId : mobx.observable,
    EffectiveDate : mobx.observable,
    Rate : mobx.observable,
  })
}