import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import store, { State } from './store';
import { Demo } from './components/Demo';
import './_reset.css';
import { ThunkDispatch } from 'redux-thunk';
import { ActionType } from 'typesafe-actions';
import { createRecordSet, CreateRecordSet, deleteRecordSet, DeleteRecordSet } from 'gdmn-recordset';
import { RecordSet, Data } from 'gdmn-recordset';
import { deleteGrid, DeleteGrid } from 'gdmn-grid';
import { FieldDefs } from 'gdmn-recordset';

declare let module: any;

const DemoConnected = connect(
  (state: State) => ({
    recordSetNames: Object.keys(state.recordSet),
    getRecordSet: (name: string) => state.recordSet[name],
    gridNames: Object.keys(state.grid)
  }),
  (dispatch: ThunkDispatch<State, never,
      ActionType<CreateRecordSet | DeleteRecordSet | DeleteGrid >>) => ({
    createRecordSet:
      (name: string, fieldDefs: FieldDefs, data: Data) => dispatch(createRecordSet({ name, rs: new RecordSet(name, fieldDefs, data) })),
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