import { getType } from 'typesafe-actions';
import { TThunkMiddleware } from '@src/app/store/middlewares';
import { mdgActions as actions, MDGAction, mdgActions } from './actions';
import { loadRSActions } from '@src/app/store/loadRSActions';
import { prepareDefaultEntityQuery } from 'gdmn-orm';

export const mdgMiddleware = (): TThunkMiddleware => ({ dispatch, getState }) => next => async (action: MDGAction) => {

  if (
    action.type !== getType(actions.addNewBinding)
    &&
    action.type !== getType(actions.editeValue)
    &&
    action.type !== getType(actions.editeMasterRS)
  ) {
    return next(action);
  }

  switch (action.type) {
    case getType(actions.addNewBinding): {
      const { masterRS, detailsRS, attr } = action.payload;

      const dRS = getState().recordSet[detailsRS];

      const linkfields = dRS && dRS.params.eq ? dRS.params.eq.link.fields.filter(fd => fd.links) : [];
      const findLF = linkfields.find(lf => lf.attribute.name === attr.name);
      if(findLF && findLF.links && findLF.links.length !== 0) {
        const entityMaster = findLF.links[0].entity;
        const eq = prepareDefaultEntityQuery(entityMaster);
        dispatch(loadRSActions.attachRS({ name: masterRS, eq }));
      }

      next(action);

      const mRS = getState().recordSet[masterRS];
      if(mRS) {
        const value = mRS.getString(mRS.params.fieldDefs.find(fd => fd.caption === 'ID')!.fieldName, mRS.params.currentRow);
        dispatch(mdgActions.editeValue({masterRS, detailsRS, attr, value}));
      }
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
      const { masterRS, detailsRS, newAttr } = action.payload;
      next(action);
      const mRS = getState().recordSet[masterRS];
      if(mRS) {
        const value = mRS.getString(mRS.params.fieldDefs.find(fd => fd.caption === 'ID')!.fieldName, mRS.params.currentRow);
        dispatch(mdgActions.editeValue({masterRS, detailsRS, attr: newAttr, value}));
      }

      const findBinding = getState().mdgState.bindMasterDetails.find(md => md.masterRS === masterRS && md.detailsRS === detailsRS && md.attr === newAttr);
      findBinding ? dispatch(loadRSActions.attachRS({name: detailsRS, eq: findBinding.entityQuery, override: true})) : undefined;
      break;
    }
  }

  return next(action);

}
