import React from 'react';
import 'antd/dist/antd.css';
import { CommonCRUD, List } from '../src';
import { createCRUDProps, delay, getRandomPage } from './service';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

export const App = () => {
  return (
    <Router>
      <CommonCRUD {...createCRUDProps('/device')} />
    </Router>
  );
};
