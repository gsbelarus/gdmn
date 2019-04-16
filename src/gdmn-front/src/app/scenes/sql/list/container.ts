import {connectView} from "@src/app/components/connectView";
import {TGdmnActions, gdmnActions} from "@src/app/scenes/gdmn/actions";
import {IState, rsMetaActions, TRsMetaActions} from "@src/app/store/reducer";
import {createRecordSet, IDataRow, RecordSet, RecordSetAction, TFieldType, IFieldDef, setCurrentRow} from "gdmn-recordset";
import {TTaskStatus} from "@gdmn/server-api";
import {apiService} from "@src/app/services/apiService";
import {createGrid, GridAction, TLoadMoreRsDataEvent, setCursorCol, TSetCursorPosEvent} from "gdmn-grid";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router";
import {compose} from "recompose";
import {ThunkDispatch} from "redux-thunk";
import {List} from "immutable";
import {SqlList, ISqlListProps} from "./component";
import uuid from "uuid";
import { createQuery } from "../data/actions";
import { SqlQueryActions } from "../data/reducer";

export const SqlListContainer = compose<ISqlListProps, RouteComponentProps<any>>(
  connectView,
  connect(
    (state: IState, ownProps: Partial<ISqlListProps>) => {
      return {
        data: {
          rs: state.recordSet['sql'],
          gcs: state.grid['sql']
        }
      }
    },
    (thunkDispatch: ThunkDispatch<IState, never, TGdmnActions | RecordSetAction | SqlQueryActions | GridAction>, ownProps) => ({
      add: () => thunkDispatch((dispatch, getState) => {
        const id = uuid();
        dispatch(createQuery('select * from gd_contact', id))
        ownProps.history!.push(`sql/${id}/edit`)
      }),
      edit: () => thunkDispatch((dispatch, getState) => {
        const id = getState().recordSet['sql'].getString('id');
        ownProps.history!.push(`sql/${id}/edit`)
      }),
      view: () => thunkDispatch((dispatch, getState) => {
        const id = getState().recordSet['sql'].getString('id');
        ownProps.history!.push(`sql/${id}`)
      }),
      onSetCursorPos: (event: TSetCursorPosEvent) => thunkDispatch((dispatch, getState) => {
        dispatch(setCurrentRow({ name: 'sql', currentRow: event.cursorRow }));
        dispatch(setCursorCol({ name: 'sql', cursorCol: event.cursorCol }));
      }),
      attachRs: () => thunkDispatch((dispatch, getState) => {
        const ds = getState().sqlDataViewState;

        const fieldDefs: IFieldDef[] = [
          {fieldName: 'id', dataType: TFieldType.String, caption: 'ID', size: 20},
          {fieldName: 'expression', dataType: TFieldType.String, caption: 'expression', size: 60}
        ];

        const sqlListData: IDataRow[] = ds.requests;

        let rs = getState().recordSet['sql']

        if (!rs) {
          let rs = RecordSet.create({
            name: 'sql',
            fieldDefs,
            data: List(sqlListData)
          });
          dispatch(createRecordSet({name: rs.name, rs}));
        }

        if (!getState().grid['sql']) {
          dispatch(
            createGrid({
              name: 'sql',
              columns: fieldDefs.map(fd => ({
                name: fd.fieldName,
                caption: [fd.caption || fd.fieldName],
                fields: [{...fd}],
                width: fd.dataType === TFieldType.String && fd.size ? fd.size * 10 : undefined
              })),
              leftSideColumns: 0,
              rightSideColumns: 0,
              hideFooter: true
            })
          );
        }
      })
    })
  )
)(SqlList);
