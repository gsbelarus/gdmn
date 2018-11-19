import * as React from 'react';
import './Demo.css';
import { RecordSet } from 'gdmn-recordset';
import { GDMNGrid } from 'gdmn-grid';
import { ConnectedGrid, ConnectedGridPanel, connectGrid, connectGridPanel } from '../gridConnected';
import { demoRecordSets } from '../data/data';

export interface IDemoProps {
  recordSetNames: string[],
  getRecordSet: (name: string) => RecordSet,
  createRecordSet: (rs: RecordSet) => void,
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

  render() {
    const { recordSetNames, getRecordSet, createRecordSet, deleteRecordSet } = this.props;
    const { grids, showPanel } = this.state;
    return (
      <div className="DemoContainer">
        <div>
          {
            demoRecordSets.map( drs => <button key={`c${drs.name}`} onClick={ () => drs.createFunc(drs.name, createRecordSet) }>Load {drs.name}...</button> )
          }
          {
            demoRecordSets.map( drs => <button key={`d${drs.name}`} onClick={ () => deleteRecordSet(drs.name) }>Delete {drs.name}</button> )
          }
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