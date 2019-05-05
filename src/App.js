import React, { Component } from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';

import './App.css';
import Header from "./Header";
import Main from "./Main";

class App extends Component {
  render() {
    return (
        <div>
          <CssBaseline />
          <Header />
          <br />
          <Main />
        </div>
    );
  }
}

export default App;
