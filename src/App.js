import React, { Component } from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';

import Header from "./Components/Header";
import Main from "./Components/Main";

class App extends Component {
  render() {
    return (
        <div>
          <CssBaseline />
          <Header />
          <Main />
        </div>
    );
  }
}

export default App;
