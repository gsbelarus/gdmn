import { mdgActions, MDGAction} from './actions';
import { EntityQuery, EntityQueryOptions, Attribute } from 'gdmn-orm';
import { getType } from 'typesafe-actions';

export interface IBindMD {
  masterRS: string;
  detailsRS: string;
  attr: Attribute<any>;
  entityQuery: EntityQuery;
  value?: string;
}

export type TMDGState = {
  bindMasterDetails: IBindMD[];
};

const initialState: TMDGState = {
  bindMasterDetails: []
};

export function reducer(state: TMDGState = initialState, action: MDGAction): TMDGState {
  switch (action.type) {

    case getType(mdgActions.addNewBinding): {
      const {masterRS, detailsRS, attr, entityQuery} = action.payload;
      
      if(state.bindMasterDetails.find( bmd => bmd.masterRS === masterRS && bmd.detailsRS === detailsRS && bmd.attr === attr)) {
        return state;
      }

      return {
        ...state,
        bindMasterDetails: [...state.bindMasterDetails, {masterRS, detailsRS, attr, entityQuery } as IBindMD]
      };
    }

    case getType(mdgActions.editeMasterRS): {
      const {masterRS, detailsRS, oldAttr, newAttr} = action.payload;
      
      const findBinding = state.bindMasterDetails.find( bmd => bmd.masterRS !== masterRS && detailsRS === bmd.detailsRS && bmd.attr === oldAttr);
      if(findBinding) {
        const whereObj = findBinding.entityQuery.options && findBinding.entityQuery.options.where ? findBinding.entityQuery.options.where : [];
        const orderObj = findBinding.entityQuery.options && findBinding.entityQuery.options.order ? findBinding.entityQuery.options.order : undefined;
        let editeBinding = state.bindMasterDetails;
        if(whereObj.find(wo => wo.equals && wo.equals.find(woe => woe.attribute === oldAttr))) {
          whereObj.map(wo => wo.equals ? wo.equals.splice( wo.equals.findIndex(woe => woe.attribute === oldAttr), 1) : wo)
        }
        const newEntityQuery: EntityQuery = new EntityQuery(
          findBinding.entityQuery.link,
          new EntityQueryOptions( undefined, undefined, whereObj, orderObj )
        );
        editeBinding[editeBinding.findIndex(fb => fb === findBinding)] = {...findBinding, masterRS, attr: newAttr, entityQuery: newEntityQuery, value: undefined}
        return {
          ...state,
          bindMasterDetails: editeBinding
        };
      } else {
        return state;
      }
    }

    case getType(mdgActions.editeValue): {
      const {masterRS, detailsRS, attr, value} = action.payload;
      
      const findBinding = state.bindMasterDetails.find( bmd => bmd.masterRS == masterRS && detailsRS === bmd.detailsRS && bmd.attr == attr);
      if(findBinding) {
        const whereObj = findBinding.entityQuery.options && findBinding.entityQuery.options.where ? findBinding.entityQuery.options.where : [];
        const orderObj = findBinding.entityQuery.options && findBinding.entityQuery.options.order ? findBinding.entityQuery.options.order : undefined;
        let editeBinding = state.bindMasterDetails;
        if(whereObj.find(wo => wo.equals && wo.equals.find(woe => woe.attribute === attr))) {
          whereObj.map(wo => wo.equals ? wo.equals.splice( wo.equals.findIndex(woe => woe.attribute === attr), 1, {
            alias: 'root',
            attribute: attr,
            value
          }) : wo)
        } else {
          whereObj.push({
            equals: [{
              alias: 'root',
              attribute: attr,
              value
            }]
          })
        }
          
        const newEntityQuery: EntityQuery = new EntityQuery(
          findBinding.entityQuery.link,
          new EntityQueryOptions( undefined, undefined, whereObj, orderObj )
        );

        editeBinding[editeBinding.findIndex(fb => fb === findBinding)] = {...findBinding, value, entityQuery: newEntityQuery}
        return {
          ...state,
          bindMasterDetails: editeBinding
        };
      } else {
        return state;
      }
    }

    case getType(mdgActions.deleteBinding): {
      const {masterRS, detailsRS, attr} = action.payload;
      
      const findBinding = state.bindMasterDetails.findIndex( bmd => bmd.masterRS === masterRS && detailsRS === bmd.detailsRS && bmd.attr === attr);
      if(findBinding >= 0) {
        return {
          ...state,
          bindMasterDetails: [...state.bindMasterDetails.slice(0, findBinding), ...state.bindMasterDetails.slice(findBinding + 1)]
        };
      } else {
        return state;
      }
    }

    default:
      return state;
  }
}
