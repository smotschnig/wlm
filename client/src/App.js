import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Landing from './components/Landing';

import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
            <Route exact path="/" component={Landing} />
        </div>
      </Router>
    );
  }
}

export default App;
