// initialize task store
let payRate = new PayRate(-1, -1, 1, "03/25/2019", 15.5)

let tasksStore = new TasksStore()
tasksStore.tasks = [
  new TaskObject({
    "Id" : 1,
    "Name" : "Register",
    "GroupName" : "",
    "IsActive" : true,
    "DescStr" : "Register",
    "Type" : 25
  }, [],
     [
    payRate
  ])
]
// simulate clicking on a task. The task view is non-React code, which works just fine.
tasksStore.taskIndex = 0;
console.log(tasksStore.currentTask); // outputs the first task
// setup React Component, giving the React main Component the store it needs to do the changes
ReactDOM.render(
    React.createElement(PayRatesContainerComponent, 
        { 
            payRatesStore : tasksStore.payRatesStore

        },
        null),
    document.querySelector('#main')
)