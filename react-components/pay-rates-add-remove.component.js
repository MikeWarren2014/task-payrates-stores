class PayRatesAddRemoveComponent extends React.Component { 
    constructor(props){  
        super(props);
    }

    render() { 
        const currentPayRate = this.props.currentPayRate
        const deleteButtonText = (currentPayRate._deleted) ? 'undo' : '-'

        const deleteButtonClassName = `btn btn-secondary ${(this.props.selectedPayRateIndex === -1) ? "disabled" : ""}`
        return (
            <div className="col-sm-6 text-right no-padding">
                <div className="btn-group float-sm-right"
                    role="group"
                    aria-label="Basic example">
                    <button id="remove-payrate"
                        onClick={(e) => {
                            this.props.deletePayRate(this.props.selectedPayRateIndex)
                        }}
                        type="button"
                        className={deleteButtonClassName}>{deleteButtonText}</button>
                    <button id="add-payrate"
                        onClick={(e) => {
                            const newPayRate = Object.assign(new PayRate(), { _added : true})
                            this.props.addNewPayRate(newPayRate)
                        }}
                        type="button"
                        className="btn btn-success">+</button>
                </div>
            </div>
        )
    }
}