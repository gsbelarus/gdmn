import { IState } from '@src/app/store/reducer';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { TGdmnActions, gdmnActionsAsync } from '../../gdmn/actions';
import { withRouter } from 'react-router';
import { DlgView, IDlgViewProps } from './DlgView';


export const DlgViewContainer = connect(
  (state: IState, ownProps: Partial<IDlgViewProps>) => {
    const entityName = ownProps.match ? ownProps.match.params.entityName : '';
    return {
      rs: state.recordSet[entityName],
      erModel: state.gdmnState.erModel
      //  viewTabs: state.gdmnState.viewTabs
    };
  },
  (thunkDispatch: ThunkDispatch<IState, never, TGdmnActions>, ownProps: Partial<IDlgViewProps>) => ({
    // saveRecord: () => thunkDispatch(gdmnActionsAsync.saveRecord()),
    // cancelRecord: () => thunkDispatch(gdmnActionsAsync.cancelRecord()),
  }),
)(withRouter(DlgView));

