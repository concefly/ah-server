import React from 'react';
import { Switch as AntdSwitch } from 'antd';

export const Switch = (p: {
  value?: boolean;
  onChange?(v: boolean): any;
  style?: React.CSSProperties;
}) => {
  return <AntdSwitch checked={p.value} onChange={p.onChange} style={p.style} />;
};
