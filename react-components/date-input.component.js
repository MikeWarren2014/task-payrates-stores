class DateInput extends React.Component {
  
    constructor(props) { 
      super(props);

      // the DOM ID
      this.id = "form-payrate-date"
      
      // do bindings
      this.handleChange = this.handleChange.bind(this);
      
    }
    
    componentDidMount() { 
      $(`#${this.id}`).datepicker({
        dateFormat: 'mm/dd/yy',
        // telling jQuery UI to pass its event to React
        onSelect : this.handleChange
      });
      
    }
    
    componentWillUnmount() { 
      $(`#${this.id}`).datepicker('destroy')
    }
    
    // handles a change to the input field
    handleChange(value) { 
      this.props.onChange(value)
    }
    
    render() { 
      return (<div className="form-group col-sm-6 no-margins no-padding">
        <div className="input-group">
          <input
            onChange={(e) => {
              this.props.onChange(e.target.value)
            }}
            type="text"
            id={this.id}
            className="form-control"
            value={this.props.value}
            disabled={this.props.disabled}
            required></input>
          <div className="input-group-addon">
            <i className="fas fa-calendar-alt"></i>
          </div>
        </div>
        <div className="invalid-feedback">
          {this.props.errors}
        </div> 
      </div>)
    }
  }