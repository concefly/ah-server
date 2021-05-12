import React, { useEffect } from 'react';
import { Button, Form, Input, InputNumber, Spin, Typography, message } from 'antd';
import { useRequest } from '../../hook/useRequest';
import { ICRUDProps } from './type';
import { useHistory } from 'react-router-dom';
import { __ } from './locale';
import { SchemaFormItems } from './SchemaForm';

const { Text } = Typography;

export const Editor = <D extends { id: any }>({
  routerPrefix = '',
  id,
  readService,
  updateService,
}: ICRUDProps<any, D> & { id: any }) => {
  const [formIns] = Form.useForm();
  const his = useHistory();

  const getReq = useRequest<any, D>(readService.invoke);
  const updateReq = useRequest(updateService.invoke);

  useEffect(() => {
    getReq.refresh(id);
  }, []);

  useEffect(() => {
    if (getReq.state.type === 'success') {
      formIns.setFields(
        Object.entries(getReq.state.data).map(([name, value]) => ({ name, value }))
      );
    }
  }, [getReq.state.type]);

  useEffect(() => {
    if (updateReq.state.type === 'success') {
      message.success('修改成功', 1).then(() => his.push(routerPrefix + '/' + id));
    }
  }, [updateReq.state.type]);

  const handleSubmit = (d: Partial<D>) => updateReq.refresh(d);

  return (
    <div>
      <Spin spinning={getReq.state.type === 'loading'}>
        <Form layout='vertical' form={formIns} onFinish={handleSubmit}>
          <SchemaFormItems schema={updateService.query.schema} />
          <Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              loading={updateReq.state.type === 'loading'}
              disabled={updateReq.state.type === 'loading'}
            >
              确定
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};
