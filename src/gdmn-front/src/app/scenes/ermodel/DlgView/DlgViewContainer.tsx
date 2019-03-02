import { IState } from '@src/app/store/reducer';
import { connect } from 'react-redux';
import { DlgView, DlgState, IDlgViewMatchParams, IDlgViewProps } from './DlgView';
import { compose, _ReactLifeCycleFunctionsThisArguments } from 'recompose';
import { connectView } from '@src/app/components/connectView';
import { RouteComponentProps } from 'react-router';

export const DlgViewContainer = compose<IDlgViewProps, RouteComponentProps<any>>(
  connect(
    (state: IState, ownProps: RouteComponentProps<IDlgViewMatchParams>) => {
      const entityName = ownProps.match ? ownProps.match.params.entityName : '';
      return {
        src: state.recordSet[entityName],
        erModel: state.gdmnState.erModel,
        dlgState: DlgState.dsEdit
      };
    }
  ),
  connectView
)(DlgView);

