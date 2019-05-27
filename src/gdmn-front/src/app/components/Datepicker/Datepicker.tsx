import React from 'react';
import CalenderJSX from './Calender';
import "@src/styles/Datepicker.css";

export interface IDatepickerState {
  showCalender: boolean,
  selectDate: string,
  selectDay: number,
  selectMonth: number,
  selectYear: number
}

export class DatepickerJSX extends React.Component<{}, IDatepickerState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      showCalender: true,
      selectDate: '',
      selectDay: new Date().getDate(),
      selectMonth: new Date().getMonth(),
      selectYear: new Date().getFullYear()
    }
  }

  setDate() {
    if (!/(31|30|2[0-9]|1[0-9]|0[1-9]|[1-9]){1}\.(12|11|10|0[1-9]|[1-9]){1}\.([1-2]{1}[0-9]{3}|[0-9]{2})/.test(this.state.selectDate)) {
      this.setState({ selectDate: '' });
    } else {
      const regArray = String(this.state.selectDate).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
      if(regArray) {
        this.setState({ selectDay: Number(regArray[1]), selectMonth: Number(regArray[2]) - 1, selectYear: Number(regArray[3]) });
        const day = regArray[1].length === 1 ? `0${regArray[1]}` : regArray[1];
        const month = regArray[2].length === 1 ? `0${regArray[2]}` : regArray[2];
        this.setState({ selectDate: `${day}.${month}.${regArray[3]}` });
      }
      
    }
  }

  changeSelectDay = (newSelectDay: number) => {
    this.setState({ selectDay: newSelectDay });
    const day = newSelectDay.toString().length === 1 ? `0${newSelectDay}` : newSelectDay
    const month = (this.state.selectMonth + 1).toString().length === 1 ? `0${this.state.selectMonth + 1}` : this.state.selectMonth + 1
    this.setState({ selectDate: `${day}.${month}.${this.state.selectYear}` });

  }

  changeSelectMonth = (newSelectMonth: number) => {
    this.setState({ selectMonth: newSelectMonth });
    const day = this.state.selectDay.toString().length === 1 ? `0${this.state.selectDay}` : this.state.selectDay
    const month = (newSelectMonth + 1).toString().length === 1 ? `0${newSelectMonth + 1}` : newSelectMonth + 1
    this.setState({ selectDate: `${day}.${month}.${this.state.selectYear}` });

  }

  changeSelectYear = (newSelectYear: number) => {
    this.setState({ selectYear: newSelectYear });
    const day = this.state.selectDay.toString().length === 1 ? `0${this.state.selectDay}` : this.state.selectDay
    const month = (this.state.selectMonth + 1).toString().length === 1 ? `0${this.state.selectMonth + 1}` : this.state.selectMonth + 1
    this.setState({ selectDate: `${day}.${month}.${newSelectYear}` });

  }

  render() {
    return (
      <div className="inputDate">
        <div className="field">
          <input
            type="text"
            className="value"
            value={this.state.selectDate}
            onChange={event => { this.setState({ selectDate: event.currentTarget.value }) }}
            onFocus={() => { this.setState({ showCalender: false }) }}
            onBlur={() => {
              this.setDate()
            }}
            onKeyDown={
              (event) => { event.key === 'Enter' ? this.setDate() : undefined }
            }
          />
          <div
            className="imgCalender"
            onClick={() => {
              this.setState({ showCalender: !this.state.showCalender });
            }}
          ></div>
        </div>
        <div className="select-date-in-calender" hidden={this.state.showCalender}>
          <CalenderJSX
            onChangeSelectDay={this.changeSelectDay}
            selectDay={this.state.selectDay}
            onChangeSelectMonth={this.changeSelectMonth}
            selectMonth={this.state.selectMonth}
            onChangeSelectYear={this.changeSelectYear}
            selectYear={this.state.selectYear}
          />
        </div>
      </div>
    );
  }
}
