class TaskObject {
  /**
   * @param {Task} task The task that is being kept track of.
   * @param {PermissionLink[]} permissionLinks A list of permission links that are being kept track of.
   * @param {PayRate[]} payrates A list of pay rates that are being kept track of.
   */
  constructor(task, permissionLinks = [], payrates = []) {
    this.Model = Object.assign({}, task);
    this.Model.Type = 25;
    this.PermissionLinks = Object.assign([], permissionLinks);
    this.Payrates = Object.assign([], payrates);
    this.OriginalObject = Object.assign({}, this);
  }
  /**
   * Gives the dirty status of the task object.
   * @returns {boolean} Tells whether or not the TaskObject has been changed.
   */
  IsChanged() {
    if (this.Model.Id == -1) {
      return true;
    }
    if (this.Model.Name != this.OriginalObject.Model.Name) {
      return true;
    }
    if (this.Model.GroupName != this.OriginalObject.Model.GroupName) {
      return true;
    }
    if (this.Model.DescStr != this.OriginalObject.Model.DescStr) {
      return true;
    }
    if (this.Model.IsActive != this.OriginalObject.Model.IsActive) {
      return true;
    }
    if (this.PermissionLinks.length != this.OriginalObject.PermissionLinks.length) {
      return true;
    }
    for (let i = 0; i < this.PermissionLinks.length; i++) {
      const element = this.PermissionLinks[i];
      const compElement = this.OriginalObject.PermissionLinks[i];
      if (JSON.stringify(element) !== JSON.stringify(compElement)) {
        return true;
      }
    }
    for (let i = 0; i < this.Payrates.length; i++) {
      const payrate = this.Payrates[i];
      if (payrate.IsChanged()) {
        return true;
      }
    }
    return false
  }
  /**
   * Reverts the changes that are on the task object.
   * @returns {TaskObject} The TaskObject with its changes discarded.
   */
  RevertChanges() {
    this.Model = Object.assign({}, this.OriginalObject.Model);
    this.PermissionLinks = Object.assign([], this.OriginalObject.PermissionLinks);
    for (let i = 0; i < this.Payrates.length; i++) {
      this.Payrates[i].RevertChanges()
    }
    return this;
  }

  /**
   * This is here for debugging purposes (i.e. with data stores that use it) and may be overwritten with business logic at any time
   */
  toString() { 
    return JSON.stringify(this, null, '\t')
  }
}