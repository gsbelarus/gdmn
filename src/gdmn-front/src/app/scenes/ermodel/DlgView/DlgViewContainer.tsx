import {TTaskStatus} from "@gdmn/server-api";
import {connectView} from "@src/app/components/connectView";
import {attr2fd, prepareDefaultEntityQuery} from "@src/app/scenes/ermodel/entityData/utils";
import {TGdmnActions} from "@src/app/scenes/gdmn/actions";
import {apiService} from "@src/app/services/apiService";
import {IState, rsMetaActions, TRsMetaActions} from "@src/app/store/reducer";
import {Semaphore} from "gdmn-internals";
import {createRecordSet, IDataRow, RecordSet, RecordSetAction} from "gdmn-recordset";
import {List} from "immutable";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router";
import {compose} from "recompose";
import {ThunkDispatch} from "redux-thunk";
import {DlgState, DlgView, IDlgViewMatchParams, IDlgViewProps} from "./DlgView";

export const DlgViewContainer = compose<IDlgViewProps, RouteComponentProps<any>>(
  connectView,
  connect(
    (state: IState, ownProps: RouteComponentProps<IDlgViewMatchParams>) => {
      const {entityName, pkSet} = ownProps.match.params;
      return {
        src: state.recordSet[entityName],
        rs: state.recordSet[`${entityName}/${pkSet}`],
        erModel: state.gdmnState.erModel,
        dlgState: DlgState.dsEdit
      };
    },
    (thunkDispatch: ThunkDispatch<IState, never, TGdmnActions | RecordSetAction | TRsMetaActions>, ownProps) => ({
      attachRs: (mutex: Semaphore) => thunkDispatch(async (dispatch, getState) => {
        const erModel = getState().gdmnState.erModel;

        if (!erModel || !Object.keys(erModel.entities).length) return;

        const {entityName, pkSet} = ownProps.match.params;
        const pkValues = pkSet.split("-");
        const entity = erModel.entity(entityName);
        const name = `${entity.name}/${pkSet}`;

        dispatch(rsMetaActions.setRsMeta(name, {}));

        await mutex.acquire();
        try {
          const query = prepareDefaultEntityQuery(entity, pkValues);

          const response = await apiService.query({
            query: query.inspect()
          });

          if (!getState().rsMeta[name]) return;

          switch (response.payload.status) {
            case TTaskStatus.SUCCESS: {
              const fieldDefs = Object.entries(response.payload.result!.aliases)
                .map(([fieldAlias, data]) => attr2fd(query, fieldAlias, data));

              const rs = RecordSet.create({
                name: `${entity.name}/${pkSet}`,
                fieldDefs,
                data: List(response.payload.result!.data as IDataRow[]),
                eq: query
              });
              dispatch(createRecordSet({name: rs.name, rs}));
            }
          }
        } finally {
          mutex.release();
        }
      })
    })
  )
)(DlgView);
