import React from 'react';
import DaysInMonthJSX from './DaysInMonth';
import { IconButton } from 'office-ui-fabric-react';

const namesMonthes = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const valuesYears: number[][] = Array.from(
  Array(new Date().getFullYear() - 1949 + (12 - (new Date().getFullYear() - 1949) % 12)),
  (v, k) => k + 1960
).reduce((p, c) => {
  if (p[p.length - 1].length == 12) {
    p.push([]);
  }
  p[p.length - 1].push(c);
  return p;
}, [[]] as number[][]);

export interface ICalendarProps {
  onChangeSelectDay: (day: number) => void,
  selectDay: number,
  onChangeSelectMonth: (month: number, year?: number) => void,
  selectMonth: number,
  onChangeSelectYear: (year: number) => void,
  selectYear: number,
  onSetToday:() => void,
}

export interface ICalendarState {
  showCalendar: boolean,
  showSelectMonth: boolean,
  showSelectYear: boolean,
  showGroupYears: number
}

export default class CalendarJSX extends React.Component<ICalendarProps, ICalendarState> {
  constructor(props: ICalendarProps) {
    super(props);
    this.state = {
      showCalendar: false,
      showSelectMonth: false,
      showSelectYear: false,
      showGroupYears: valuesYears.findIndex((item) => item.includes(Number(this.props.selectYear)))
    }
  }

  render() {
    return (
      <div className="calendar" >
        <div className="month-and-year">
          <div
            className="month"
            onClick={() => {
              this.setState({ showSelectMonth: !this.state.showSelectMonth })
              this.setState({ showSelectYear: false })
            }}
          >{namesMonthes[this.props.selectMonth]}</div>
          <div
            className="year"
            onClick={() => {
              this.setState({ showSelectYear: !this.state.showSelectYear })
              this.setState({ showSelectMonth: false })
            }}
          >{this.props.selectYear}</div>
        </div>
        {
          this.state.showSelectMonth ?
            <div className="monthes">
              {namesMonthes.map((item, idx) => {
                return <div
                  className="nameMonth"
                  key={idx}
                  onClick={() => {
                    this.props.onChangeSelectMonth(idx);
                    this.setState({ showSelectMonth: !this.state.showSelectMonth })
                    this.setState({ showSelectYear: false });
                  }}
                >{item.slice(0, 3)}</div>
              }).reduce((p, c) => {
                if (p[p.length - 1].length == 4) {
                  p.push([]);
                }
                p[p.length - 1].push(c);
                return p;
              }, [[]] as JSX.Element[][]).map((item, idx) => {
                return <div className="groupMonthes" key={idx}>{item}</div>
              })}
            </div>
            : this.state.showSelectYear ?
              <div className="showYears">
                <div
                  hidden={this.state.showGroupYears - 1 === 0}
                  onClick={() => {
                    this.setState({ showGroupYears: this.state.showGroupYears - 1 })
                  }}
                >
                  <IconButton iconProps={{ iconName: 'ChevronLeftSmall' }} ariaLabel="ChevronLeftSmall" />
                </div>
                <div className="years">
                  {valuesYears[this.state.showGroupYears].map((item, idx) => {
                    return <div
                      className="valueYears"
                      key={idx}
                      onClick={() => {
                        this.props.onChangeSelectYear(item);
                        this.setState({ showSelectYear: !this.state.showSelectYear })
                        this.setState({ showSelectMonth: false })
                      }}
                    >{item}</div>
                  }).reduce((p, c) => {
                    if (p[p.length - 1].length == 4) {
                      p.push([]);
                    }
                    p[p.length - 1].push(c);
                    return p;
                  }, [[]] as JSX.Element[][]).map((item, idx) => {
                    return <div className="groupYears" key={idx}>{item}</div>
                  })}
                </div>
                <div
                  hidden={this.state.showGroupYears + 1 > valuesYears.length - 1}
                  onClick={() => {
                    this.setState({ showGroupYears: this.state.showGroupYears + 1 })
                  }}
                >
                  <IconButton iconProps={{ iconName: 'ChevronRightSmall' }} ariaLabel="ChevronRightSmall" />
                </div>
              </div>
              :
              <div>
                <DaysInMonthJSX
                  onChangeSelectDay={this.props.onChangeSelectDay}
                  selectDay={this.props.selectDay}
                  selectMonth={this.props.selectMonth}
                  selectYear={this.props.selectYear}
                  onChangeSelectMonth={this.props.onChangeSelectMonth}
                  onChangeSelectYear={this.props.onChangeSelectYear}
                  onSetToday={this.props.onSetToday}
                  />
                <div
                  className="today"
                  onClick={() => {
                    this.props.onSetToday();
                    const currYear = new Date().getFullYear();
                    this.setState({ showGroupYears: valuesYears.findIndex((item) => item.includes(currYear)) });
                  }}
                >Сегодня</div>
              </div>
        }
      </div>
    );
  }
}
