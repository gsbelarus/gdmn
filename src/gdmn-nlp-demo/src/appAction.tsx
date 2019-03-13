import { ThunkDispatch } from 'redux-thunk';
import { State } from './store';
import { setERModelLoading, loadERModel } from './ermodel/actions';
import { deserializeERModel } from 'gdmn-orm';
import { ParameterLoadAction } from './parameterLoad/reducer';
import { ERModelAction } from './ermodel/reducer';
import { ExecuteCommand } from './engine/types';

export const load = (url: string, name: string, executeCommand: ExecuteCommand) => (dispatch: ThunkDispatch<State, never, ParameterLoadAction | ERModelAction>, _getState: () => State) => {
  dispatch(setERModelLoading({ name, loading: true }));
  fetch(url)
    .then(res => res.json())
    .then(res => dispatch(loadERModel({ name, erModel: deserializeERModel(res, true), executeCommand })))
    .then(_res => dispatch(setERModelLoading({ name, loading: false })))
    .catch(err => {
      dispatch(setERModelLoading({ name, loading: false }));
      alert(err.message ? err.message : err);
      console.log(err);
    });
}
