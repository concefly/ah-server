import React, { useContext } from 'react';
import { IAnalyzeProps, IInspectItem } from './type';

export const AnalyzeContext = React.createContext<IAnalyzeProps>({
  routerPrefix: '',
  entityMap: {},
});

export const InspectContext = React.createContext<IInspectItem>({
  service: (async () => {}) as any,
});
