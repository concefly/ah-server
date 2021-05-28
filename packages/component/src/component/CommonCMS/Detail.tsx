import React from 'react';
import { Button, Card, Col, Descriptions, Popconfirm, Row, Space, Typography } from 'antd';
import { useRequest } from 'ah-hook';
import { Link, useHistory } from 'react-router-dom';
import { __ } from './locale';
import { DataFormatter } from './DataFormatter';
import _ from 'lodash';
import { useCMSContext } from './context';
import { useReadServiceInfo, useLabelRender, useLogger } from './hook';
import { SchemaHelper } from './SchemHelper';
import { isSchemaObject } from 'ah-api-type';

export const Detail = ({ id }: { id: any }) => {
  const his = useHistory();
  const {
    createService,
    routerPrefix,
    entity,
    updateService,
    deleteService,
    idMapper = 'id',
  } = useCMSContext();

  const logger = useLogger('Detail');

  const deleteReq = useRequest(deleteService);
  const rsInfo = useReadServiceInfo(id);
  const labelRender = useLabelRender();

  const renderItems = () => {
    let items: any[] = [];
    let splitItems: any[] = [];

    if (rsInfo) {
      const itemSchema = rsInfo.itemSchema;

      const uiDef = SchemaHelper.getUiDef(itemSchema);
      const follows =
        uiDef?.detail?.columns ||
        Object.keys((isSchemaObject(itemSchema) && itemSchema.properties) || {});

      const split = uiDef?.detail?.split;

      follows.map(follow => {
        const subSchema = SchemaHelper.getByDataDotPath(itemSchema, follow);
        if (!subSchema) {
          logger.error(`no subSchema at ${follow}, skip`);
          return;
        }

        const content = rsInfo.detailData && (
          <DataFormatter
            rootValue={rsInfo.detailData}
            follow={follow}
            value={_.get(rsInfo.detailData, follow)}
            schema={subSchema}
          />
        );

        const title = labelRender({ key: _.last(follow.split('.'))!, schema: subSchema });

        if (split?.includes(follow)) {
          splitItems.push(
            <Card key={follow} size='small' title={title}>
              {content}
            </Card>
          );
        } else {
          items.push(
            <Descriptions.Item key={follow} label={title}>
              {content}
            </Descriptions.Item>
          );
        }
      });
    }

    return { items, splitItems };
  };

  const { items, splitItems } = renderItems();

  const splitContent = splitItems.length ? (
    <Space direction='vertical' style={{ width: '100%' }}>
      {splitItems}
    </Space>
  ) : null;
  const mainContent = <Descriptions column={splitContent ? 1 : 3}>{items}</Descriptions>;

  return (
    <div>
      <Row justify='space-between' align='middle' style={{ marginBottom: 16 }}>
        <Col>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {rsInfo?.detailDataTitle || id}
          </Typography.Title>
        </Col>
        <Col>
          <Space>
            {updateService && (
              <Link to={`${routerPrefix}/${entity}/${id}/edit`}>
                <Button type='primary'>编辑</Button>
              </Link>
            )}
            {createService && (
              <Link to={`${routerPrefix}/${entity}/new`}>
                <Button>新建</Button>
              </Link>
            )}
            <Button
              loading={rsInfo?.readReq.state.type === 'loading'}
              disabled={rsInfo?.readReq.state.type === 'loading'}
              onClick={() => rsInfo?.readReq.refresh(rsInfo.readReq.lastQuery()!)}
            >
              刷新
            </Button>
            {deleteReq && (
              <Popconfirm
                title='确定删除？'
                placement='left'
                onConfirm={() =>
                  deleteReq
                    .refresh({ [idMapper]: id })
                    .then(() => his.replace(routerPrefix + '/' + entity))
                }
              >
                <Button
                  danger
                  loading={deleteReq.state.type === 'loading'}
                  disabled={deleteReq.state.type === 'loading'}
                >
                  删除
                </Button>
              </Popconfirm>
            )}
          </Space>
        </Col>
      </Row>
      <Row gutter={16}>
        {splitContent ? (
          <>
            <Col span={16}>{mainContent}</Col>
            <Col span={8}>{splitContent}</Col>
          </>
        ) : (
          <Col span={24}>{mainContent}</Col>
        )}
      </Row>
    </div>
  );
};
