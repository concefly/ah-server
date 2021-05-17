import React, { useEffect } from 'react';
import { Button, Form, Typography, message } from 'antd';
import { useHistory } from 'react-router-dom';
import { __ } from './locale';
import { SchemaFormItems } from './SchemaFormItems';
import { useCMSContext } from './context';
import { useCreateServiceInfo } from './hook';

const { Text } = Typography;

export const Creator = () => {
  const { routerPrefix, entity } = useCMSContext();
  const his = useHistory();

  const ucInfo = useCreateServiceInfo();

  useEffect(() => {
    if (ucInfo?.createReq.state.type === 'success') {
      message.success('保存成功', 0.5).then(() => his.push(routerPrefix + '/' + entity));
    }
  }, [ucInfo?.createReq.state.type]);

  // 空守卫
  if (!ucInfo) return null;

  const handleSubmit = (d: any) => ucInfo?.createReq.refresh(d);

  return (
    <div>
      <Form layout='vertical' onFinish={handleSubmit}>
        <SchemaFormItems rootSchema={ucInfo.querySchema} />
        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            loading={ucInfo.createReq.state.type === 'loading'}
            disabled={ucInfo.createReq.state.type === 'loading'}
          >
            确定
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
