import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import store, { State } from './store';
import { Demo } from './components/Demo';
import './_reset.css';
import { ThunkDispatch } from 'redux-thunk';
import { rsActions, RSAction } from 'gdmn-recordset';
import { RecordSet } from 'gdmn-recordset';
import { deleteGrid, GridAction } from 'gdmn-grid';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

declare let module: any;

initializeIcons();

const DemoConnected = connect(
  (state: State) => ({
    recordSetNames: Object.keys(state.recordSet),
    getRecordSet: (name: string) => state.recordSet[name],
    gridNames: Object.keys(state.grid)
  }),
  (dispatch: ThunkDispatch<State, never, RSAction | GridAction>) => ({
    createRecordSet:
      (rs: RecordSet) => dispatch(rsActions.createRecordSet({ name: rs.name, rs })),
    deleteRecordSet:
      (name: string) => dispatch(rsActions.deleteRecordSet({ name })),
    deleteGrid:
      (name: string) => dispatch(deleteGrid({ name })),
  })
)(Demo);

ReactDOM.render(
  <Provider store={store}>
    <DemoConnected />
  </Provider>,
  document.getElementById('root')
);

if (module.hot) {
   module.hot.accept();
};