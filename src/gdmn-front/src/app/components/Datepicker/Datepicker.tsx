import React from 'react';
import CalendarJSX from './Calendar';
import "@src/styles/Datepicker.css";
import { TextField, IconButton } from "office-ui-fabric-react";

export interface IDatepickerProps {
  key?: string,
  label?: string,
  value?: string
}

export interface IDatepickerState {
  showCalendar: boolean,
  value: Date
  selectDate: string,
  selectDay: number,
  selectMonth: number,
  selectYear: number
}

export class DatepickerJSX extends React.Component<IDatepickerProps, IDatepickerState> {
  private _node: React.RefObject<HTMLDivElement>;

  constructor(props: IDatepickerProps) {
    super(props);
    const currDate = this.props.value ? new Date(this.props.value) : new Date();
    this.state = {
      value: currDate,
      showCalendar: false,
      selectDate: this.props.value ? `${currDate.getDate().toString().padStart(2, '0')}.${(currDate.getMonth() + 1).toString().padStart(2, '0')}.${currDate.getFullYear()}` : '',
      selectDay: currDate.getDate(),
      selectMonth: currDate.getMonth(),
      selectYear: currDate.getFullYear()
    }
    this._node = React.createRef();
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false);
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false);
  }

  handleClick = (e: MouseEvent) => {
    if(this._node!.current && this._node!.current.contains(e.target as Node)) return;
    this.setState({ showCalendar: false });
  }

  setDate() {
    const regArray = String(this.state.selectDate).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (!/(31|30|2[0-9]|1[0-9]|0[1-9]|[1-9]){1}\.(12|11|10|0[1-9]|[1-9]){1}\.([1-2]{1}[0-9]{3}|[0-9]{2})/.test(this.state.selectDate)
        || regArray === null) {
      this.setState({ selectDate: '' });
    } else {
      if(regArray) {
        this.setState({ selectDay: Number(regArray[1]), selectMonth: Number(regArray[2]) - 1, selectYear: Number(regArray[3]) });
        const day = regArray[1].padStart(2, '0');
        const month = (Number(regArray[2])).toString().padStart(2, '0');
        this.setState({ selectDate: `${day}.${month}.${regArray[3]}` });
      }
    }
  }

  changeSelectDay = (newSelectDay: number) => {
    this.setState({ selectDay: newSelectDay });
    const day = newSelectDay.toString().padStart(2, '0');
    const month = (this.state.selectMonth + 1).toString().padStart(2, '0');
    this.setState({ selectDate: `${day}.${month}.${this.state.selectYear}` });
  }

  changeSelectMonth = (newSelectMonth: number, newSelectYear?: number) => {
    this.setState({ selectMonth: newSelectMonth });
    if(newSelectYear) this.setState({ selectYear: newSelectYear })
    const day = this.state.selectDay.toString().padStart(2, '0');
    const month = (newSelectMonth + 1).toString().padStart(2, '0');
    this.setState({ selectDate: `${day}.${month}.${newSelectYear ? newSelectYear : this.state.selectYear}` });
  }

  changeSelectYear = (newSelectYear: number) => {
    this.setState({ selectYear: newSelectYear });
    const day = this.state.selectDay.toString().padStart(2, '0');
    const month = (this.state.selectMonth + 1).toString().padStart(2, '0');
    this.setState({ selectDate: `${day}.${month}.${newSelectYear}` });
  }

  today = () => {
    const currDate = new Date();
    this.setState({ selectDay: currDate.getDate(), selectMonth: currDate.getMonth(), selectYear: currDate.getFullYear() });
    const day = currDate.getDate().toString().padStart(2, '0');
    const month = (currDate.getMonth() + 1).toString().padStart(2, '0');
    this.setState({ selectDate: `${day}.${month}.${currDate.getFullYear()}` });
  }

  render() {
    const key = this.props.key;
    return (
      <div
        className={`inputDate ${key}`}
        key={this.props.key}
      >
        <div className="field">
          <TextField
            key={this.props.key}
            label={this.props.label}
            value={this.state.selectDate}
            onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => { this.setState({ selectDate: newValue! }) }}
            onBlur={() => {
              this.setDate();
            }}
            onKeyDown={
              (event: React.KeyboardEvent<HTMLInputElement>) => { event.key === 'Enter' ? this.setDate() : undefined }
            }
          />
          <IconButton iconProps={{ iconName: 'Calendar' }} className="icon-calendar" onClick={() => { this.setState({ showCalendar: true }); }} />
        </div>
        {
          this.state.showCalendar
          ?
          <div
            className={`window-calendar-${this.props.key}`}
            ref={this._node}
          >
            <CalendarJSX
              onChangeSelectDay={this.changeSelectDay}
              selectDay={this.state.selectDay}
              onChangeSelectMonth={this.changeSelectMonth}
              selectMonth={this.state.selectMonth}
              onChangeSelectYear={this.changeSelectYear}
              selectYear={this.state.selectYear}
              onSetToday={this.today}
            />
            </div>
          : undefined
        }
      </div>
    );
  }
}
