import React, { Component } from 'react';
import './App.css';
import { Route, BrowserRouter } from 'react-router-dom';
import { MorphBoxContainer } from './morphology/MorphBoxContainer';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { SyntaxBoxContainer } from './syntax/SyntaxBoxContainer';
import { ERModelBoxContainer } from './ermodel/ERModelBoxContainer';
import { Actions, State, dispatchThunk } from './store';
import { setERModelLoading, loadERModel } from './ermodel/actions';
import { ThunkDispatch } from 'redux-thunk';
import { deserializeERModel } from 'gdmn-orm';

class App extends Component {

  componentDidMount() {
    dispatchThunk(
      (dispatch: ThunkDispatch<State, never, Actions>, getState: () => State) => {
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
    );
  }

  render() {
    return (
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <div>
          <CommandBar
            items={this.getItems()}
          />
          <div className="WorkArea">
            <Route exact={false} path={`/morphology`} component={MorphBoxContainer} />
            <Route exact={false} path={`/syntax`} component={SyntaxBoxContainer} />
            <Route exact={false} path={`/ermodel`} component={ERModelBoxContainer} />
          </div>
        </div>
      </BrowserRouter>
    );
  }

  private getItems = (): ICommandBarItemProps[] => {
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
        text: 'ERModel',
        href: `${process.env.PUBLIC_URL}/ermodel`
      }
    ];
  };
};

export default App;
