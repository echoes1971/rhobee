import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { ThemeContext } from "./ThemeContext";

class App extends Component {
  render() {
    return (
      <ThemeContext.Consumer>
        {({ toggleTheme, themeClass }) => (
          <div className="App">
            cippa
            <div className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h2>Welcome to React</h2>
            </div>
            <p className="App-intro">
              To get started, edit <code>src/App.js</code> and save to reload.
            </p>
            <div className={themeClass}>
              <button className="btn btn-secondary" onClick={toggleTheme}>
                Toggle Tema
              </button>
              {/* router e pagine */}
            </div>
          </div>
        )}
      </ThemeContext.Consumer>
    );
  }
}

export default App;
