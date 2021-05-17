import React from 'react';
import { Typography } from 'antd';
import _ from 'lodash';
import { useReadServiceInfo } from './hook';

export const SimpleDetail = ({ id }: { id: any }) => {
  const rsInfo = useReadServiceInfo(id);

  return (
    <div>
      <Typography.Paragraph strong>
        {rsInfo?.detailData
          ? rsInfo.detailData.title ||
            rsInfo.detailData.name ||
            _.truncate(rsInfo.detailData.content, { length: 20 })
          : id + ''}
      </Typography.Paragraph>
    </div>
  );
};
