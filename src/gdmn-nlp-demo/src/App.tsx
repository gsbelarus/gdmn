import React, { Component } from 'react';
import './App.css';
import { Route, BrowserRouter } from 'react-router-dom';
import { MorphBoxContainer } from './morphology/MorphBoxContainer';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';

class App extends Component {
  render() {
    return (
      <div>
        <BrowserRouter>
          <div>
            <CommandBar
              items={this.getItems()}
            />
            <div className="WorkArea">
              <Route path="/morphology" component={MorphBoxContainer} />
            </div>
          </div>
        </BrowserRouter>
      </div>
    );
  }

  private getItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'morphology',
        text: 'Morphology',
        href: '/morphology'
      }
    ];
  };
};

export default App;
