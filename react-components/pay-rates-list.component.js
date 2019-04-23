/// <reference path="../../global.js" />

class PayRatesListComponent extends React.Component { 
    constructor(props) { 
        super(props)
    }

    // component setup
    componentDidMount() { 

    }

    // component teardown
    componentWillUnmount() { 

    }

    render() { 
        // get list of items
        const payRates = this.props.payRates
        let selectValue
        const options = payRates.map((payRate, idx) => {
            let payrateClass = ''
            if (!payRate) { 
                payrateClass = 'added'
                const empId = parseInt($('.form-id').text()),
                    taskId = parseInt($('.form-tasks option:selected').val())

                payRate = Object.assign(new PayRate(-1, empId, taskId), { _added : true})
            } else { 
                if (payRate._added) { 
                    payrateClass = 'added'
                } else if (payRate._deleted) { 
                    payrateClass = 'deleted'
                } else if (payRate.IsChanged()) { 
                    payrateClass = 'modified'
                }
            }
            // create a unique ID for the <option>
            const uniqueID = `task-${payRate.TaskId}-${payRate.GetReadableDate()}-payrate`

            // if we're on the same pay rate as that which is selected
            if (idx === this.props.selectedPayRateIndex) { 
                // the unique ID shall become the parent <select>'s value
                selectValue = uniqueID
            }

            return (<option 
                key={idx}
                id={uniqueID}
                value={uniqueID}
                onClick={(e) => { 
                    this.props.onChange(idx)
                }}
                className={payrateClass}
                >{payRate.toString()}</option>)
        })

        return (
            <div className="row">
                <div className="form-group full-width no-margins">
                    <select
                        size="3"
                        className="form-control"
                        name="form-rates"
                        id="form-rates"
                        value={selectValue}
                        >
                        {options}
                    </select>
                </div>
            </div>
        )
    }
}