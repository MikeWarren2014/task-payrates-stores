/// <reference path="../task.js" />

class PayRatesContainerComponent extends React.Component { 

    constructor(props) { 
        super(props)
        const payRates = (props.payRatesStore) ? props.payRatesStore.payRates : props.payRates

        this.state = {
            payrates : payRates,
            errors : {
                rate : '',
                date : ''
            },
            selectedPayRateIndex : -1,
            payRateIndicesToDelete : [],
            dateString : ''

        }

        this.payRates = payRates

        // binding done here; // TODO: look into an auto-binding third-party library to automate all this
        this.addNewPayRate = this.addNewPayRate.bind(this)
        this.removePayRateAt = this.removePayRateAt.bind(this)
        this.updateCurrentPayRate = this.updateCurrentPayRate.bind(this)
        this.updateCurrentPayRateDate = this.updateCurrentPayRateDate.bind(this)
        this.updateCurrentPayRateAmount = this.updateCurrentPayRateAmount.bind(this)
        this.updateSelectedPayRateIndex = this.updateSelectedPayRateIndex.bind(this)
    }

    // setup logic
    componentDidMount() { 
        
    }

    // teardown logic
    componentWillUnmount() { 

    }

    // business logic

    /**
     * Adds a new payrate
     * @param { PayRate } value the value to append
     */
    addNewPayRate(value) { 
        const newDateString = value.GetReadableDate()

        this.props.payRatesStore.payRates.push(value)
        this.props.payRatesStore.payRateIndex = this.props.payRatesStore.payRates.length - 1
        this.props.payRatesStore.dateString = newDateString
        
    }

    /**
     * Removes a payrate at a specified index
     * @param {number} idx 
     */
    removePayRateAt(idx) { 
        if ((idx >= this.props.payRatesStore.payRates.length) || (idx < 0)) { 
            throw RangeError("The index you are trying to mark for deletion is not valid")
        }

        let payRateToDelete = this.props.payRatesStore.payRates[idx]

        // if the pay rate to delete has been added, since last save, we just plain delete it here
        if (payRateToDelete._added) { 
            this.props.payRatesStore.payRates.splice(idx, 1)
        }
        // otherwise, we're going to mark it _deleted and add its index to this.props.payRateIndicesToDelete
        else { 
            this.props.payRatesStore.payRates[idx] = Object.assign(payRateToDelete, { _deleted : true})
        }
    }

    /**
     * Updates the current pay rate
     * @param { PayRate } newPayRate
     **/
    updateCurrentPayRate(newPayRate) { 
        this.props.payRatesStore.currentPayRate = newPayRate;
    }

    /**
     * Updates the current pay rate date
     * @param {string} dateString 
     */
    updateCurrentPayRateDate(dateString) {
        const newPayRate = Object.assign(new PayRate(), 
            this.props.payRatesStore.currentPayRate, 
            { EffectiveDate : new Date(dateString) } );
        this.props.payRatesStore.dateString = dateString;
        this.updateCurrentPayRate(newPayRate);
    }
    
    updateCurrentPayRateAmount(amount) { 
        const newPayRate = Object.assign(new PayRate(), 
            this.props.payRatesStore.currentPayRate, 
            { Rate : Number(amount) } )
        this.updateCurrentPayRate(newPayRate)
    }

    updateSelectedPayRateIndex(newIndex = -1) { 
        const newDateString = (newIndex === -1) ? '' : 
            this.state.payrates[newIndex].GetReadableDate()
        this.setState({
            ...this.state,
            selectedPayRateIndex : newIndex,
            dateString : newDateString
        })
    }


    // what this Component shall render

    render() { 
        /**
         * the actual validator
         * @param {{payRate : PayRate, dateString : string}} value 
         */
        const validator = (value) => { 
            // check the payRate part
            let errors = validate(value.payRate)
            // now, check the dateString
            if (!value.dateString) { 
                errors.date = "Enter a date"
            }

            return errors
        }

        return (
            <div>
                <ErrorBoundary>
                    <div className="row" style={{marginBottom: "5px"}}>
                        <div className="col-sm-6 text-left no-padding">
                            Default Pay Rates
                            <i className="fa fa-question text-primary"
                                data-toggle="tooltip"
                                title="When adding this task to an employee, if there are default pay rates they will automatically be added to the employee for that task. They can be modified after the task is added."
                                aria-hidden="true"></i>
                        </div>
                        <PayRatesAddRemoveComponent 
                            payRateIndicesToDelete={this.props.payRatesStore.payRateIndicesToDelete}
                            currentPayRate={this.props.payRatesStore.currentPayRate}
                            selectedPayRateIndex={this.props.payRatesStore.payRateIndex}
                            addNewPayRate={(payRate) => {
                                this.props.payRatesStore.addNewPayRate(payRate)
                                this.props.payRatesStore.payRateIndex = this.props.payRatesStore.payRates.length - 1
                            }}
                            deletePayRate={(idx) => {
                                let payRate = this.props.payRatesStore.payRates[idx];

                                // if it is marked _deleted, revert that
                                if (payRate._deleted) { 
                                    this.props.payRatesStore.undoRemovePayRateAt(idx)
                                }
                                // otherwise, we go to actually delete
                                else { 
                                    Alert("Are you sure you would like to remove the rate selected?",
                                        "",
                                        () => { 
                                            this.props.payRatesStore.removePayRateAt(idx)
                                        })
                                }
                            }}
                            />
                    </div>
                    <PayRatesListComponent 
                        payRates={this.props.payRatesStore.payRates}
                        selectedPayRateIndex={this.props.payRatesStore.payRateIndex}
                        onChange={(newIdx) => { 
                            this.props.payRatesStore.payRateIndex = newIdx;
                        }}/>
                    <NewPayRateRow 
                        disabled={(this.props.payRatesStore.payRateIndex === -1)}
                        onChange={this.updateCurrentPayRate}
                        onPayRateAmountChange={this.updateCurrentPayRateAmount}
                        onPayRateDateChange={this.updateCurrentPayRateDate} 
                        dateString={this.props.payRatesStore.dateString}
                        value={this.props.payRatesStore.currentPayRate} 
                        validator={validator}
                        />
                </ErrorBoundary>
            </div>
        )
    }
}

// marking this Component as observer
mobxReact.observer(PayRatesContainerComponent)


// validation logic

/**
 * Validates a PayRate
 * @param { PayRate } value
 * @returns { Object } any errors
 **/
function validate(value = {}) { 
    // extract rate,date from value
    const rate = value.Rate,
          date = value.EffectiveDate
    
    let errors = {}
    
    // rate better resolve to something
    if (!rate) { 
        errors.rate = "Enter a valid pay rate amount"
    }
    
    // date better be valid
    if ((!date) || (!date.toLocaleDateString)) { 
        errors.date = "Enter a date"
    }
    else if (date.toLocaleDateString("en-US") === "Invalid Date") { 
        errors.date = "Enter a valid pay rate date"
    }
    
    return errors
}
