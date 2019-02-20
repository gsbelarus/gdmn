import { IState } from '@src/app/store/reducer';
import { connect } from 'react-redux';
import { DlgView, IDlgViewProps, DlgState, IDlgViewMatchParams } from './DlgView';
import { compose } from 'recompose';
import { connectView } from '@src/app/components/connectView';
import { RouteComponentProps } from 'react-router';

export const DlgViewContainer = compose<any, RouteComponentProps<IDlgViewMatchParams>>(
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

