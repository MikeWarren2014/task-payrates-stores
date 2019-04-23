class NewPayRateRow extends React.Component { 
    constructor(props) { 
      super(props)
      
    }

    get readableDate() { 
      return this.props.value.GetReadableDate()
    }
    
    render() { 
      const value = this.props.value

      let date = this.props.dateString,
        rate = 0
      
      const errors = this.props.validator({
        payRate : value,
        dateString : date
      }),
        anyErrors  = Object.values(errors).filter((error) => error).length

      // TODO: do we need to do this every time? When exactly do we need to do this?
      // if (value.EffectiveDate) {
      //     date = value.GetReadableDate()
      //     if (date == 'Invalid Date') { 
      //         date = ''
      //     }
      // }

      if (date == 'Invalid Date') { 
        date = ''
      }

      if (value.Rate) { 
          rate = value.Rate
      }
      
      return <div className="row">
          <RateField 
            errors={errors.rate}
            onKeyUp={(e) => {
              // extract the value 
              const value = e.target.value
              this.props.onPayRateAmountChange(value)
            }}
            disabled={this.props.disabled}
            value={rate.toFixed(2)}
            />
          <DateInput 
            errors={errors.date}
            onChange={this.props.onPayRateDateChange}
            disabled={this.props.disabled}
            value={date}
            />
      </div>
    }
}