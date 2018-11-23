import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import store, { State } from './store';
import { Demo } from './components/Demo';
import './_reset.css';
import { ThunkDispatch } from 'redux-thunk';
import { ActionType } from 'typesafe-actions';
import { createRecordSet, CreateRecordSet, deleteRecordSet, DeleteRecordSet } from 'gdmn-recordset';
import { RecordSet } from 'gdmn-recordset';
import { deleteGrid, DeleteGrid } from 'gdmn-grid';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

declare let module: any;

initializeIcons();

const DemoConnected = connect(
  (state: State) => ({
    recordSetNames: Object.keys(state.recordSet),
    getRecordSet: (name: string) => state.recordSet[name],
    gridNames: Object.keys(state.grid)
  }),
  (dispatch: ThunkDispatch<State, never,
      ActionType<CreateRecordSet | DeleteRecordSet | DeleteGrid >>) => ({
    createRecordSet:
      (rs: RecordSet) => dispatch(createRecordSet({ name: rs.name, rs })),
    deleteRecordSet:
      (name: string) => dispatch(deleteRecordSet({ name })),
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