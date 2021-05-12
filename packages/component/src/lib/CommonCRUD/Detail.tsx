import React, { useEffect } from 'react';
import { Button, Descriptions, Popconfirm, Space, Table, Typography } from 'antd';
import { Schema } from 'jsonschema';
import { useRequest } from '../../hook/useRequest';
import { ICRUDProps, IDType, IPagination } from './type';
import { Link, useHistory } from 'react-router-dom';
import { __ } from './locale';

const { Text } = Typography;

export const Detail = <D extends { id: any }>({
  id,
  routerPrefix,
  readService,
  deleteService,
}: ICRUDProps<any, D> & { id: any }) => {
  const his = useHistory();
  const readReq = useRequest<any, D>(readService.invoke);
  const deleteReq = useRequest<any, D>(deleteService.invoke);

  useEffect(() => {
    readReq.refresh(id);
  }, []);

  const renderItems = () => {
    let items: any[] = [];

    if (readService.response.schema.properties) {
      Object.entries(readService.response.schema.properties).map(([key, schema]) => {
        items.push(
          <Descriptions.Item label={schema.title || __(key)}>
            {readReq.state.type === 'success' ? (readReq.state.data as any)[key] : '--'}
          </Descriptions.Item>
        );
      });
    }

    return items.map(d => React.cloneElement(d, { key: d.props.label }));
  };

  return (
    <Descriptions
      title={
        readReq.state.type === 'success'
          ? (readReq.state.data as any).title || (readReq.state.data as any).name
          : id + ''
      }
      extra={
        <Space>
          <Link to={`${routerPrefix}/${id}/edit`}>
            <Button type='primary'>编辑</Button>
          </Link>
          <Link to={`${routerPrefix}/new`}>
            <Button>新建</Button>
          </Link>
          <Button
            loading={readReq.state.type === 'loading'}
            disabled={readReq.state.type === 'loading'}
            onClick={() => readReq.refresh(readReq.lastQuery()!)}
          >
            刷新
          </Button>
          <Popconfirm
            title='确定删除？'
            placement='left'
            onConfirm={() => deleteReq.refresh(id).then(() => his.replace(routerPrefix))}
          >
            <Button
              danger
              loading={deleteReq.state.type === 'loading'}
              disabled={deleteReq.state.type === 'loading'}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      }
    >
      {renderItems()}
    </Descriptions>
  );
};
