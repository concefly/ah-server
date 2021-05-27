import React, { useEffect } from 'react';
import { Button, Form, Spin, Typography, message, FormProps } from 'antd';
import { Link, useHistory } from 'react-router-dom';
import { SchemaFormItems } from './SchemaFormItems';
import { useReadServiceInfo, useUpdateServiceInfo } from './hook';
import { useCMSContext } from './context';
import _ from 'lodash';

const { Text } = Typography;

export const Editor = ({ id }: { id: any }) => {
  const cmsCtx = useCMSContext();
  const { entity, routerPrefix, updateService, idMapper = 'id', customRender } = cmsCtx;

  const his = useHistory();

  const rsInfo = useReadServiceInfo(id);
  const usInfo = useUpdateServiceInfo();

  useEffect(() => {
    if (usInfo?.updateReq.state.type === 'success') {
      message.success('修改成功', 0.5).then(() => his.push(routerPrefix + '/' + entity + '/' + id));
    }
  }, [usInfo?.updateReq.state.type]);

  // 空守卫
  if (!rsInfo || !usInfo) return null;

  const handleSubmit = (d: any) => {
    // 浅比较第一层，去掉值相同的字段，减少传输量
    const diffKeys = rsInfo.detailData
      ? Object.keys(d).filter(k => !_.isEqual(rsInfo.detailData[k], d[k]))
      : Object.keys(d);

    const uploadKeys = [...diffKeys, idMapper];
    const uploadValue = _.pick(d, uploadKeys);
    usInfo.updateReq.refresh(uploadValue);
  };

  const renderEditorForm = () => {
    if (!updateService) return null;

    const formProps: FormProps = {
      // type fix
      // detailData 有值的时候重新初始化表单
      ...{ key: !!rsInfo.detailData + '' },
      initialValues: rsInfo.detailData,
      layout: 'vertical',
      onFinish: handleSubmit,
    };

    if (customRender?.form) {
      const ret = customRender.form({ formProps, rsInfo, usInfo });
      if (ret !== false) return ret;
    }

    return (
      <Form {...formProps}>
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
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link to={`${routerPrefix}/${entity}/${id}`}>
          <Button>返回</Button>
        </Link>
      </div>
      <Spin spinning={rsInfo.readReq.state.type === 'loading'}>{renderEditorForm()}</Spin>
    </div>
  );
};
