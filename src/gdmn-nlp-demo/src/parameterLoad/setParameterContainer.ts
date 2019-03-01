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
    ermodel: state.ermodel,
    loading: state.ermodel['db'] ? state.ermodel['db'].loading : true
  }),
  (dispatch: ThunkDispatch<State, never, ParameterLoadAction | ERModelAction>) => ({
    onLoadByParameter: (host: string, port: string, isReadFile: boolean) =>
      isReadFile 
        ? dispatch(load(`${process.env.PUBLIC_URL}/data/ermodel.serialized.json`, 'db'))
        : dispatch(load(`http://${host}:${port}/ermodel`, 'db')),
    onParametersLoading: (host: string, port: string, isReadFile: boolean) =>
      dispatch(actions.parametersLoading( {host, port, isReadFile} )),
  })
)(SetParameterLoad);
