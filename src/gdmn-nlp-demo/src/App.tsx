import React, { Component } from 'react';
import './App.css';
import { Route, Link, HashRouter } from 'react-router-dom';
import Morphology from './morphology/Morphology';

class App extends Component {
  render() {
    return (
      <div className="App">
        <HashRouter>
          <div>
            <ul>
              <li>
                <Link to="/morphology">Morphology</Link>
              </li>
            </ul>

            <hr />

            <Route path="/morphology" component={Morphology} />
          </div>
        </HashRouter>
      </div>
    );
  }
}

export default App;
