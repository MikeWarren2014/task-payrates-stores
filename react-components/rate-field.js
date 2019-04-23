class RateField extends React.Component { 
    constructor(props) { 
      super(props);
      this.id = "form-pay-rate"
    }
    
    componentDidMount() { 
      $(`#${this.id}`)
        .maskMoney({
          bringCaretAtEndOnFocus : false,
          thousands: ''
        
        })
    }

    componentWillUnmount() { 
      $(`#${this.id}`).maskMoney('destroy')
    }
    
    render() { 
        return <div className="form-group col-sm-6 no-margins no-padding">
          <div className="input-group">
            <div className="input-group-addon">
              <i className="fa fa-usd"></i>
            </div>
            <input
              onKeyUp={this.props.onKeyUp}
              type="text"
              min="0"
              className="form-control decimal-field"
              value={this.props.value}
              name="form-pay-rate"
              id={this.id}
              disabled={this.props.disabled}
              required></input>
          </div>
          <div className="invalid-feedback">
              {this.props.errors}
          </div>
        </div>
    }
}