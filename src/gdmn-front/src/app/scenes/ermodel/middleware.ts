import { getType } from 'typesafe-actions';
import { TThunkMiddleware } from '@src/app/store/middlewares';
import { mdgActions as actions, MDGAction, mdgActions } from './actions';
import { loadRSActions } from '@src/app/store/loadRSActions';
import { prepareDefaultEntityQuery, EntityQuery, Attribute } from 'gdmn-orm';
import { apiService } from '@src/app/services/apiService';
import { RecordSet, IDataRow } from 'gdmn-recordset';
import { List } from "immutable";
import { attr2fd } from './EntityDataView/utils';
import { IState } from '@src/app/store/reducer';
import { ThunkDispatch } from 'redux-thunk';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';
import { AnyAction } from 'redux';

const getRS = async (name: string, eq: EntityQuery) => {
  return apiService.query({ query: eq.inspect() })
  .then( response => {
    const result = response.payload.result!;
    const fieldDefs = Object.entries(result.aliases).map( ([fieldAlias, data]) => attr2fd(eq, fieldAlias, data.linkAlias, data.attribute) );
    return RecordSet.create({
      name,
      fieldDefs,
      data: List(result.data as IDataRow[]),
      eq,
      sql: result.info
    });
  });
}

const setNewRS = (detailsRS: RecordSet, nameMasterRS: string, attr: Attribute<any>, dispatch: ThunkDispatch<IState, { apiService: GdmnPubSubApi; }, AnyAction>) => {

  const linkfields = detailsRS.params.eq ? detailsRS.params.eq.link.fields.filter(fd => fd.links) : [];
  const findLF = linkfields.find(lf => lf.attribute.name === attr.name);
  if(findLF && findLF.links && findLF.links.length !== 0) {
    const entityMaster = findLF.links[0].entity;
    const eq = prepareDefaultEntityQuery(entityMaster);
    dispatch(loadRSActions.attachRS({ name: nameMasterRS, eq }));
    getRS(nameMasterRS, eq).then(
      rs => {
        const value = rs.getString(rs.params.fieldDefs.find(fd => fd.caption === 'ID')!.fieldName, rs.params.currentRow);
        dispatch(mdgActions.editeValue({masterRS: nameMasterRS, detailsRS: detailsRS.name, attr, value}));
      }
    );
  }
}

export const mdgMiddleware = (): TThunkMiddleware => ({ dispatch, getState }) => next => async (action: MDGAction) => {

  if (
    action.type !== getType(actions.addNewBinding)
    &&
    action.type !== getType(actions.editeValue)
    &&
    action.type !== getType(actions.editeMasterRS)
    &&
    action.type !== getType(actions.deleteBinding)
  ) {
    return next(action);
  }

  switch (action.type) {
    case getType(actions.addNewBinding): {
      const { masterRS, detailsRS, attr } = action.payload;

      const dRS = getState().recordSet[detailsRS];

      if(!getState().recordSet[masterRS]) {
        setNewRS(dRS, masterRS, attr, dispatch);
      }

      next(action);
      const findBinding = getState().mdgState.bindMasterDetails.find(md => md.masterRS === masterRS && md.detailsRS === detailsRS && md.attr === attr);
      findBinding ? dispatch(loadRSActions.attachRS({name: detailsRS, eq: findBinding.entityQuery, override: true})) : undefined;
      break;
    }

    case getType(actions.editeValue): {
      const { masterRS, detailsRS, attr } = action.payload;
      next(action);

      const findBinding = getState().mdgState.bindMasterDetails.find(md => md.masterRS === masterRS && md.detailsRS === detailsRS && md.attr === attr);
      findBinding ? dispatch(loadRSActions.attachRS({name: detailsRS, eq: findBinding.entityQuery, override: true})) : undefined;
      break;
    }

    case getType(actions.editeMasterRS): {
      const { masterRS, detailsRS, newAttr, oldAttr } = action.payload;
      const findOldBinding = getState().mdgState.bindMasterDetails.find(md =>md.detailsRS === detailsRS && md.attr === oldAttr);
      next(action);
      const dRS = getState().recordSet[detailsRS];
      const mRS = getState().recordSet[masterRS];
      !mRS ? setNewRS(dRS, masterRS, newAttr, dispatch) : undefined;

      const findBinding = getState().mdgState.bindMasterDetails.find(md => md.masterRS === masterRS && md.detailsRS === detailsRS && md.attr === newAttr);
      if(findBinding) {
        dispatch(loadRSActions.attachRS({name: detailsRS, eq: findBinding.entityQuery, override: true}))
        findOldBinding && findOldBinding.masterRS !== masterRS ? dispatch(loadRSActions.deleteRS({name: findOldBinding.masterRS})) : undefined;
      }
      break;
    }
    
    case getType(actions.deleteBinding): {
      const { masterRS } = action.payload;
      next(action);
      dispatch(loadRSActions.deleteRS({name: masterRS}));
      break;
    }
  }

  return next(action);

}
