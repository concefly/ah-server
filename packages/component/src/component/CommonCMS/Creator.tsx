import React, { useEffect } from 'react';
import { Button, Form, Typography, message, FormProps } from 'antd';
import { useHistory } from 'react-router-dom';
import { __ } from './locale';
import { SchemaFormItems } from './SchemaFormItems';
import { useCMSContext } from './context';
import { useCreateServiceInfo } from './hook';

const { Text } = Typography;

export const Creator = () => {
  const { routerPrefix, entity, customRender } = useCMSContext();
  const his = useHistory();

  const csInfo = useCreateServiceInfo();

  useEffect(() => {
    if (csInfo?.createReq.state.type === 'success') {
      message.success('保存成功', 0.5).then(() => his.push(routerPrefix + '/' + entity));
    }
  }, [csInfo?.createReq.state.type]);

  // 空守卫
  if (!csInfo) return null;

  const handleSubmit = (d: any) => csInfo?.createReq.refresh(d);

  const renderCreatorForm = () => {
    const formProps: FormProps = { layout: 'vertical', onFinish: handleSubmit };

    if (customRender?.form) {
      const ret = customRender.form({ formProps, csInfo });
      if (ret !== false) return ret;
    }

    return (
      <Form {...formProps}>
        <SchemaFormItems rootSchema={csInfo.querySchema} />
        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            loading={csInfo.createReq.state.type === 'loading'}
            disabled={csInfo.createReq.state.type === 'loading'}
          >
            确定
          </Button>
        </Form.Item>
      </Form>
    );
  };

  return <div>{renderCreatorForm()}</div>;
};
