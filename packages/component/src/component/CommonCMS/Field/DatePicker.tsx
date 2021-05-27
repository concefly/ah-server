import dayjs, { Dayjs } from 'dayjs';
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs';
import generatePicker from 'antd/es/date-picker/generatePicker';
import React from 'react';

const BaseDatePicker = generatePicker<Dayjs>(dayjsGenerateConfig);

export const DatePicker = (p: {
  value?: string;
  onChange?: (v?: string) => any;
  showTime?: boolean;
  style?: React.CSSProperties;
}) => {
  return (
    <BaseDatePicker
      {...p}
      value={p.value ? dayjs(p.value) : undefined}
      onChange={v => p.onChange?.(v?.format('YYYY-MM-DD HH:mm:ss'))}
    />
  );
};
