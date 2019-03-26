import {TTaskStatus} from "@gdmn/server-api";
import {connectView} from "@src/app/components/connectView";
import {attr2fd} from "@src/app/scenes/ermodel/entityData/utils";
import {gdmnActions, TGdmnActions} from "@src/app/scenes/gdmn/actions";
import {apiService} from "@src/app/services/apiService";
import {IState, rsMetaActions, TRsMetaActions} from "@src/app/store/reducer";
import {Semaphore} from "gdmn-internals";
import {EntityLink, EntityQuery, EntityQueryField, EntityQueryOptions, ScalarAttribute} from "gdmn-orm";
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
          const q = new EntityQuery(
            new EntityLink(
              entity,
              "z",
              Object.values(entity.attributes)
                .filter((attr) => attr instanceof ScalarAttribute && attr.type !== "Blob")
                .map(attr => new EntityQueryField(attr))
            ),
            new EntityQueryOptions(
              undefined,
              undefined,
              [{
                equals: pkValues.map((value, index) => ({
                  alias: "z",
                  attribute: entity.pk[index],
                  value
                }))
              }])
          );

          const value = await apiService.query({
            query: q.inspect()
          });

          if (!getState().rsMeta[name]) return;

          switch (value.payload.status) {
            case TTaskStatus.SUCCESS: {
              const fieldDefs = Object.entries(value.payload.result!.aliases)
                .map(([fieldAlias, data]) => {
                  const attr = entity.attributes[data.attribute];
                  if (!attr) {
                    throw new Error(`Unknown attribute ${data.attribute}`);
                  }
                  return attr2fd(q!, fieldAlias, data);
                });

              const rs = RecordSet.create({
                name: `${entity.name}/${pkSet}`,
                fieldDefs,
                data: List(value.payload.result!.data as IDataRow[]),
                eq: q
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
