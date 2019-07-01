import React from 'react';
import CalendarJSX from './Calendar';
import "@src/styles/Datepicker.css";
import { TextField, IconButton, ITextField } from "office-ui-fabric-react";

export interface IDatepickerProps {
  fieldName?: string,
  label?: string,
  value?: string,
  onChange: (newValue?: string) => void,
  onFocus: () => void,
  componentRef?: (ref: ITextField | null) => void
}

export interface IDatepickerState {
  showCalendar: boolean,
  value: string,
  selectDate: string,
  selectDay: number,
  selectMonth: number,
  selectYear: number
}

export class DatepickerJSX extends React.Component<IDatepickerProps, IDatepickerState> {
  private _node: React.RefObject<HTMLDivElement>;
  private ref: React.MutableRefObject<ITextField | null>;

  constructor(props: IDatepickerProps) {
    super(props);
    const currDate = this.props.value ? new Date(this.props.value) : new Date();
    this.state = {
      value: currDate.toString(),
      showCalendar: false,
      selectDate: this.props.value ? `${currDate.getDate().toString().padStart(2, '0')}.${(currDate.getMonth() + 1).toString().padStart(2, '0')}.${currDate.getFullYear()}` : '',
      selectDay: currDate.getDate(),
      selectMonth: currDate.getMonth(),
      selectYear: currDate.getFullYear()
    }
    this._node = React.createRef();
    this.ref = React.createRef();
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
    const regArray = this.state.selectDate.replace( /\s/g, '').match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (!/(31|30|2[0-9]|1[0-9]|0[1-9]|[1-9]){1}\.(12|11|10|0[1-9]|[1-9]){1}\.([1-2]{1}[0-9]{3}|[0-9]{2})/.test(this.state.selectDate)
        || regArray === null) {
      this.setState({ selectDate: '' });
      this.props.onChange('');
    } else {
      if(regArray) {
        this.setState({ selectDay: Number(regArray[1]), selectMonth: Number(regArray[2]) - 1, selectYear: Number(regArray[3]) });
        const day = regArray[1].padStart(2, '0');
        const month = (Number(regArray[2])).toString().padStart(2, '0');
        this.setState({ selectDate: `${day}.${month}.${regArray[3]}` });
        this.setState({ value: (new Date(+regArray[3], +month, +day)).toString() });
        this.props.onChange((new Date(+regArray[3], +month - 1, +day)).toString());
      }
    }
  }

  changeSelectDay = (newSelectDay: number) => {
    this.setState({ selectDay: newSelectDay });
    const day = newSelectDay.toString().padStart(2, '0');
    const month = (this.state.selectMonth + 1).toString().padStart(2, '0');
    this.setState({ selectDate: `${day}.${month}.${this.state.selectYear}` });
    this.setState({ value: (new Date(this.state.selectYear, +month, +day)).toString() });
    this.props.onChange((new Date(this.state.selectYear, +month - 1, +day)).toString());
  }

  changeSelectMonth = (newSelectMonth: number, newSelectYear?: number) => {
    this.setState({ selectMonth: newSelectMonth });
    if(newSelectYear) this.setState({ selectYear: newSelectYear })
    const day = this.state.selectDay.toString().padStart(2, '0');
    const month = (newSelectMonth + 1).toString().padStart(2, '0');
    this.setState({ selectDate: `${day}.${month}.${newSelectYear ? newSelectYear : this.state.selectYear}` });
    this.setState({ value: (new Date(this.state.selectYear, +month, +day)).toString() });
    this.props.onChange((new Date(this.state.selectYear, +month - 1, +day)).toString());
  }

  changeSelectYear = (newSelectYear: number) => {
    this.setState({ selectYear: newSelectYear });
    const day = this.state.selectDay.toString().padStart(2, '0');
    const month = (this.state.selectMonth + 1).toString().padStart(2, '0');
    this.setState({ selectDate: `${day}.${month}.${newSelectYear}` });
    this.setState({ value: (new Date(newSelectYear, +month, +day)).toString() });
    this.props.onChange((new Date(newSelectYear, +month - 1, +day)).toString());
  }

  today = () => {
    const currDate = new Date();
    this.setState({ selectDay: currDate.getDate(), selectMonth: currDate.getMonth(), selectYear: currDate.getFullYear() });
    const day = currDate.getDate().toString().padStart(2, '0');
    const month = (currDate.getMonth() + 1).toString().padStart(2, '0');
    this.setState({ selectDate: `${day}.${month}.${currDate.getFullYear()}` });
    this.setState({ value: (new Date(currDate.getFullYear(), +month, +day)).toString() });
    this.props.onChange((new Date(currDate.getFullYear(), +month - 1, +day)).toString());
  }

  render() {
    const key = this.props.fieldName;
    return (
      <div
        className={`inputDate ${key}`}
        key={this.props.fieldName}
      >
        <div className="field">
          <TextField
            key={this.props.fieldName}
            label={this.props.label}
            value={this.state.selectDate}
            onChange={
              (_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) =>
                {
                  this.setState({ selectDate: newValue! });
                  newValue ? this.setState({ value:  newValue }) : this.setState({ value:  '' });
                  this.props.onChange(newValue ? newValue : '');
                }
            }
            onBlur={() => {
              this.setDate();
            }}
            onFocus={
              () => {
                this.props.onFocus();
              }
            }
            componentRef={
              r => {
                this.ref.current = r;
                if (this.props.componentRef) {
                  this.props.componentRef(r)
                }
              }
            }
            onKeyDown={
              (event: React.KeyboardEvent<HTMLInputElement>) => {
                if(event.altKey && event.key === 'ArrowDown') {
                  this.setState({ showCalendar: true })
                }
                if(event.key === ' ') {
                  this.today();
                }
                event.key === 'Enter' ? this.setDate() : undefined;
              }
            }
          />
          <IconButton
            iconProps={{ iconName: 'Calendar' }}
            className="icon-calendar"
            onClick={() => { this.setState({ showCalendar: true }) }}
          />
        </div>
        {
          this.state.showCalendar
          ?
          <div
            className={`window-calendar-${this.props.fieldName}`}
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
