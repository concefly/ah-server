import React, { useEffect } from 'react';
import { Button, Form, Input, InputNumber, Spin, Typography, message } from 'antd';
import { useRequest } from '../../hook/useRequest';
import { ICRUDProps } from './type';
import { useHistory } from 'react-router-dom';
import { __ } from './locale';
import { SchemaFormItems } from './SchemaForm';

const { Text } = Typography;

export const Creator = <D extends { id: any }>({
  routerPrefix = '',
  createService,
}: ICRUDProps<any, D>) => {
  const his = useHistory();
  const createReq = useRequest(createService.invoke);

  useEffect(() => {
    if (createReq.state.type === 'success') {
      const { id } = createReq.state.data;
      message.success('保存成功', 1).then(() => his.push(routerPrefix + '/' + id));
    }
  }, [createReq.state.type]);

  const handleSubmit = (d: Partial<D>) => createReq.refresh(d);

  return (
    <div>
      <Form layout='vertical' onFinish={handleSubmit}>
        <SchemaFormItems schema={createService.query.schema} />
        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            loading={createReq.state.type === 'loading'}
            disabled={createReq.state.type === 'loading'}
          >
            确定
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
