import { connect } from 'react-redux';
import { IState } from '@src/app/store/reducer';
import { connectView } from '@src/app/components/connectView';
import { compose } from 'recompose';
import { Internals } from './component';

export const InternalsContainer = compose<any, any>(
  connect(
    (state: IState) => {
      return {
        erModel: state.gdmnState.erModel,
        recordSet: state.recordSet,
        rsMeta: state.rsMeta,
        viewTabs: state.gdmnState.viewTabs
      }
    }
  ),
  connectView
)(Internals);