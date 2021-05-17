import React from 'react';
import 'antd/dist/antd.css';
import { CommonCMSList, createCMSProps } from '../src';
import { service } from './service';
import { HashRouter as Router } from 'react-router-dom';

export const App = () => {
  const ss = createCMSProps(service);

  return (
    <Router>
      <CommonCMSList list={ss} />
    </Router>
  );
};
