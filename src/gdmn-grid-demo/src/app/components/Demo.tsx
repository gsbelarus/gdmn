import * as React from 'react';
import './Demo.css';
import { INBRBCurrency, INBRBRate } from '../types';
import { RecordSet, Data } from 'gdmn-recordset';
import nbrbCurrencies from '../../util/nbrbcurrencies.json';
import nbrbRates from '../../util/nbrbrates.json';
import { List } from 'immutable';
import { FieldDefs, TFieldType } from 'gdmn-recordset';
import { GDMNGrid } from 'gdmn-grid';
import { ConnectedGrid, ConnectedGridPanel, connectGrid, connectGridPanel } from '../gridConnected';

export interface IDemoProps {
  recordSetNames: string[],
  getRecordSet: (name: string) => RecordSet,
  createRecordSet: (name: string, fieldDefs: FieldDefs, data: Data) => void,
  deleteRecordSet: (name: string) => void,
  gridNames: string[],
  deleteGrid: (name: string) => void
}

interface IGridAndPanel {
  Grid: ConnectedGrid,
  Panel: ConnectedGridPanel,
  refGrid?: GDMNGrid
};

interface IGrids {
  [name: string]: IGridAndPanel
};

interface IDemoState {
  grids: IGrids,
  showPanel: boolean
}

export class Demo extends React.Component<IDemoProps, IDemoState> {

  state: IDemoState = {
    grids: {},
    showPanel: true
  };

  getGridByName = (name: string) => {
    const { grids } = this.state;
    if (grids[name]) {
      return grids[name].refGrid;
    } else {
      return undefined;
    }
  }

  showHideGrid = (name: string) => {
    const { grids } = this.state;
    const { getRecordSet, deleteGrid } = this.props;

    if (grids[name]) {
      const newGrids = {...grids};
      delete newGrids[name];
      this.setState({ grids: newGrids });
      deleteGrid(name);
    } else {
      const rs = getRecordSet(name);
      const getGridRef = () => {
        const res = this.state.grids[name].refGrid;

        if (!res) {
          throw new Error(`refGrid is unassinged`);
        }

        return res;
      }

      this.setState({
        grids: {
          ...grids,
          [name]: {
            Grid: connectGrid(name, rs, getGridRef),
            Panel: connectGridPanel(name, rs, getGridRef)
          }
        }
      });
    }
  }

  showHidePanel = () => {
    this.setState({ showPanel: !this.state.showPanel })
  }

  loadCurrencies = () => {
    const { createRecordSet } = this.props;

    const fieldDefs = [
      {
        fieldName: 'Cur_Abbreviation',
        dataType: TFieldType.String,
        caption: 'Буквенный код',
        required: true,
        size: 3
      },
      {
        fieldName: 'Cur_Name',
        dataType: TFieldType.String,
        caption: 'Наименование',
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_ID',
        dataType: TFieldType.Integer,
        caption: 'Внутренний код',
        required: true
      },
      {
        fieldName: 'Cur_ParentID',
        dataType: TFieldType.Integer,
        caption: 'Внутренний код для связи',
        required: true
      },
      {
        fieldName: 'Cur_Code',
        dataType: TFieldType.String,
        caption: 'Цифровой код',
        required: true,
        size: 3
      },
      {
        fieldName: 'Cur_Name_Bel',
        dataType: TFieldType.String,
        caption: 'Назва',
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_Name_Eng',
        dataType: TFieldType.String,
        caption: 'Name',
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_QuotName',
        dataType: TFieldType.String,
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_QuotName_Bel',
        dataType: TFieldType.String,
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_QuotName_Eng',
        dataType: TFieldType.String,
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_NameMulti',
        dataType: TFieldType.String,
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_Name_BelMulti',
        dataType: TFieldType.String,
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_Name_EngMulti',
        dataType: TFieldType.String,
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_Scale',
        dataType: TFieldType.Integer,
        caption: 'Количество единиц',
        required: true
      },
      {
        fieldName: 'Cur_Periodicity',
        dataType: TFieldType.Integer,
        caption: 'Периодичность выставления курса',
        required: true
      },
      {
        fieldName: 'Cur_DateStart',
        dataType: TFieldType.Date,
        caption: 'Дата включения в перечень валют',
        required: true
      },
      {
        fieldName: 'Cur_DateEnd',
        dataType: TFieldType.Date,
        caption: 'Дата исключения из перечня валют',
        required: true
      },
    ];

    const data = List<INBRBCurrency>(nbrbCurrencies as any);

    createRecordSet('currency', fieldDefs, data);
  }

  deleteCurrencies = () => {
    this.props.deleteRecordSet('currency');
  }

  loadRates = () => {
    const { createRecordSet } = this.props;

    const fieldDefs = [
      {
        fieldName: 'Cur_ID',
        dataType: TFieldType.Integer,
        caption: 'ИД',
        required: true
      },
      {
        fieldName: 'Date',
        dataType: TFieldType.Date,
        caption: 'Дата',
        required: true
      },
      {
        fieldName: 'Cur_Abbreviation',
        dataType: TFieldType.String,
        caption: 'Буквенный код',
        required: true,
        size: 3
      },
      {
        fieldName: 'Cur_Scale',
        dataType: TFieldType.Integer,
        caption: 'Количество единиц',
        required: true
      },
      {
        fieldName: 'Cur_Name',
        dataType: TFieldType.String,
        caption: 'Наименование',
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_OfficialRate',
        dataType: TFieldType.Currency,
        caption: 'Курс',
        required: true
      }
    ];

    const data = List<INBRBRate>(nbrbRates as any);

    createRecordSet('rate', fieldDefs, data);
  }

  deleteRates = () => {
    this.props.deleteRecordSet('rate');
  }

  render() {
    const { recordSetNames, getRecordSet } = this.props;
    const { grids, showPanel } = this.state;
    return (
      <div className="DemoContainer">
        <div>
          <button onClick={this.loadCurrencies}>
            Load currencies r/s
          </button>
          <button onClick={this.deleteCurrencies}>
            Delete currencies r/s
          </button>
          <button onClick={this.loadRates}>
            Load rates r/s
          </button>
          <button onClick={this.deleteRates}>
            Delete rates r/s
          </button>
        </div>
        <div className="Toolbar">
          {
            recordSetNames.map( n =>
              <button key={n} onClick={ () => this.showHideGrid(n) }>
                {n}
              </button>
            )
          }
          {
            grids.length ?
              <button onClick={this.showHidePanel}>
                Show/hide panel
              </button>
            : undefined
          }
        </div>
        <div className="WorkArea">
          {
            Object.entries(grids).map( ([name, g]) => {
              if (!g) return undefined;

              const { Panel, Grid } = g;
              return (
                <div className="GridArea" key={name}>
                  {showPanel && g.Panel ?
                    <div className="GridPanel">
                      <Panel rs={getRecordSet(name)} />
                    </div> : undefined
                  }
                  <div className={showPanel ? "GridForm" : "GridFormNoPanel"}>
                    <Grid ref={ grid => grid && (grids[name].refGrid = (grid as any).getWrappedInstance()) } rs={getRecordSet(name)} />
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
};