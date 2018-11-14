import React, { Component } from 'react';
import './App.css';
import { Route, BrowserRouter } from 'react-router-dom';
import { MorphBoxContainer } from './morphology/MorphBoxContainer';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { SyntaxBoxContainer } from './syntax/SyntaxBoxContainer';

class App extends Component {
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
      }
    ];
  };
};

export default App;
