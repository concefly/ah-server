import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';

const mount = document.createElement('div');
document.body.appendChild(mount);

ReactDOM.render(<App />, mount);
