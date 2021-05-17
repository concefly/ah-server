import React, { useEffect } from 'react';
import { Button, Form, Input, InputNumber, Spin, Typography, message } from 'antd';
import { useRequest } from '../../hook/useRequest';
import { ICMSProps } from './type';
import { Link, useHistory } from 'react-router-dom';
import { SchemaFormItems } from './SchemaFormItems';
import { useReadServiceInfo, useUpdateServiceInfo } from './hook';
import { useCMSContext } from './context';

const { Text } = Typography;

export const Editor = ({ id }: { id: any }) => {
  const { entity, routerPrefix, updateService } = useCMSContext();

  const [formIns] = Form.useForm();
  const his = useHistory();

  const rsInfo = useReadServiceInfo(id);
  const usInfo = useUpdateServiceInfo();

  useEffect(() => {
    if (rsInfo?.detailData) {
      formIns.setFieldsValue(rsInfo.detailData);
    }
  }, [rsInfo?.detailData]);

  useEffect(() => {
    if (usInfo?.updateReq.state.type === 'success') {
      message.success('修改成功', 0.5).then(() => his.push(routerPrefix + '/' + entity + '/' + id));
    }
  }, [usInfo?.updateReq.state.type]);

  // 空守卫
  if (!rsInfo || !usInfo) return null;

  const handleSubmit = (d: any) => usInfo.updateReq.refresh(d);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link to={`${routerPrefix}/${entity}/${id}`}>
          <Button>返回</Button>
        </Link>
      </div>
      <Spin spinning={rsInfo.readReq.state.type === 'loading'}>
        {updateService && (
          <Form layout='vertical' form={formIns} onFinish={handleSubmit}>
            <SchemaFormItems rootSchema={usInfo.querySchema} />
            <Form.Item>
              <Button
                type='primary'
                htmlType='submit'
                loading={usInfo.updateReq.state.type === 'loading'}
                disabled={usInfo.updateReq.state.type === 'loading'}
              >
                确定
              </Button>
            </Form.Item>
          </Form>
        )}
      </Spin>
    </div>
  );
};
