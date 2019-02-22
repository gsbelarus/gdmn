import { connect } from 'react-redux';
import { State } from '../store';
import { SetParameterLoad } from './setParameterLoad';
import { ParameterLoadAction } from './reducer';
import * as actions from './actions';
import { load } from '../appAction';
import { ThunkDispatch } from 'redux-thunk';
import { ERModelAction } from '../ermodel/reducer';

export const SetParameterContainer = connect(
  (state: State) => ({
    ...state.param,
    ermodel: state.ermodel
  }),
  (dispatch: ThunkDispatch<State, never, ParameterLoadAction | ERModelAction>) => ({
    onSetTextHost: (text: string) => dispatch(actions.setHost(text)),
    onSetTextPort: (text: string) => dispatch(actions.setPort(text)),
    onSetReadFile: (check: boolean) => dispatch(actions.setIsReadFile(check)),
    onLoadByParameter: (host: string, port: string, isReadFile: boolean) =>
      isReadFile 
        ? dispatch(load(`${process.env.PUBLIC_URL}/data/ermodel.serialized.json`, 'db'))
        : dispatch(load(`http://${host}:${port}/ermodel`, 'db'))
  })
)(SetParameterLoad);
