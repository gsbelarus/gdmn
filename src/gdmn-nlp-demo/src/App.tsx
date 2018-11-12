import React, { Component } from 'react';
import './App.css';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          gdmn-nlp-demo
        </header>
        <DefaultButton>
          I am a button.
        </DefaultButton>
      </div>
    );
  }
}

export default App;
