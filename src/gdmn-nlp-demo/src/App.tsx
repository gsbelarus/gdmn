import React, { Component } from 'react';
import './App.css';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { MorphBoxContainer } from './morphology/MorphBoxContainer';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { SyntaxBoxContainer } from './syntax/SyntaxBoxContainer';
import { ERModelBoxContainer } from './ermodel/ERModelBoxContainer';
import { Actions, State } from './store';
import { setERModelLoading, loadERModel } from './ermodel/actions';
import { ThunkDispatch } from 'redux-thunk';
import { deserializeERModel, ERModel } from 'gdmn-orm';
import { connect } from 'react-redux';

interface IAppProps {
  erModel?: ERModel;
  loadingERModel: boolean;
  onLoadERModel: () => void;
};

class InternalApp extends Component<IAppProps, {}> {

  componentDidMount() {
    const { erModel, onLoadERModel, loadingERModel } = this.props;

    if (!erModel && !loadingERModel) {
      onLoadERModel();
    }
  }

  render() {
    return (
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <div>
          <CommandBar
            items={this.getItems()}
          />
          <div className="WorkArea">
            <Switch>
              <Route exact={false} path={`/morphology`} component={MorphBoxContainer} />
              <Route exact={false} path={`/syntax`} component={SyntaxBoxContainer} />
              <Route exact={false} path={`/ermodel`} component={ERModelBoxContainer} />
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    );
  }

  private getItems = (): ICommandBarItemProps[] => {
    const { loadingERModel } = this.props;

    return [
      {
        key: 'morphology',
        text: 'Morphology',
        href: `${process.env.PUBLIC_URL}/morphology`
      },
      {
        key: 'syntax',
        text: 'Syntax',
        href: `${process.env.PUBLIC_URL}/syntax`
      },
      {
        key: 'ermodel',
        text: loadingERModel ? 'Loading ER Model...' : 'ERModel',
        href: `${process.env.PUBLIC_URL}/ermodel`
      }
    ];
  };
};

export default connect(
  (state: State) => ({
    erModel: state.ermodel.erModel,
    loadingERModel: state.ermodel.loading
  }),
  (dispatch: ThunkDispatch<State, never, Actions>) => ({
    onLoadERModel: () => dispatch(
      (dispatch: ThunkDispatch<State, never, Actions>, _getState: () => State) => {
        dispatch(setERModelLoading(true));

        fetch(`${process.env.PUBLIC_URL}/data/ermodel.serialized.json`)
        .then( res => res.text() )
        .then( res => JSON.parse(res) )
        .then( res => dispatch(loadERModel(deserializeERModel(res))) )
        .then( _res => dispatch(setERModelLoading(false)) )
        .catch( err => {
          dispatch(setERModelLoading(false));
          console.log(err);
         });
      }
    )
  })
)(InternalApp);

