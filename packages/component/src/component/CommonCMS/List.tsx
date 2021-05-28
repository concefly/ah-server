import React, { useEffect, useRef } from 'react';
import { Button, Col, Form, Row, Space, Table } from 'antd';
import { Link } from 'react-router-dom';
import { __ } from './locale';
import { DataFormatter } from './DataFormatter';
import _ from 'lodash';
import { SchemaFormItems } from './SchemaFormItems';
import { useCMSContext } from './context';
import { useLabelRender, useListServiceInfo } from './hook';
import { useUrlState } from 'ah-hook';
import { SchemaHelper } from './SchemHelper';
import { isSchemaObject } from 'ah-api-type';

export const List = () => {
  const {
    readService,
    createService,
    routerPrefix,
    entity,
    updateService,
    idMapper = 'id',
  } = useCMSContext();

  const topDivRef = useRef<HTMLDivElement>(null);

  const lsInfo = useListServiceInfo();
  const labelRender = useLabelRender();

  const { urlState, setUrlState } = useUrlState<any>({});

  // 初始化刷新
  useEffect(() => {
    lsInfo?.req.refresh(urlState);
  }, []);

  // 空守卫
  if (!lsInfo) return null;

  const handleRefresh = (query: any) => {
    const nq = { ...lsInfo.req.lastQuery(), ...query };
    lsInfo.req.refresh(nq);
    setUrlState(nq);

    // 滚动到页面顶部
    if (topDivRef.current) {
      (topDivRef.current as any).scrollIntoViewIfNeeded
        ? (topDivRef.current as any).scrollIntoViewIfNeeded()
        : topDivRef.current.scrollIntoView();
    }
  };

  const renderSearchForm = () => {
    return (
      <Form layout='inline' initialValues={urlState} onFinish={d => handleRefresh({ ...d })}>
        <SchemaFormItems rootSchema={lsInfo.querySchema} />
        <Form.Item>
          <Button type='primary' htmlType='submit'>
            搜索
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const renderColumns = () => {
    if (!lsInfo) return [];

    let columns: any[] = [];

    const itemSchema = lsInfo.itemSchema;
    const uiDef = SchemaHelper.getUiDef(itemSchema);
    const follows =
      uiDef?.list?.columns ||
      Object.keys((isSchemaObject(itemSchema) && itemSchema.properties) || {});

    // object 类型 -> 每个字段占一列
    follows.forEach(follow => {
      const itemDataSchema = SchemaHelper.getByDataDotPath(itemSchema, follow);
      if (!itemDataSchema) return;

      columns.push(
        <Table.Column
          key={follow}
          title={labelRender({ key: _.last(follow.split('.'))!, schema: itemDataSchema })}
          dataIndex={follow.split('.')}
          render={(value: any, rootValue: any) => {
            return (
              <DataFormatter
                rootValue={rootValue}
                follow={follow}
                value={value}
                schema={itemDataSchema}
                style={{ display: 'inline-block', maxWidth: 600 }}
              />
            );
          }}
        />
      );
    });

    // 插入 action
    columns.push(
      <Table.Column
        key='$$action'
        title='操作'
        render={(_x, d: any) => {
          let actions: any[] = [];

          if (readService) {
            actions.push(
              <Link to={`${routerPrefix}/${entity}/${(d as any)[idMapper]}`}>查看</Link>
            );
          }

          if (updateService) {
            actions.push(
              <Link to={`${routerPrefix}/${entity}/${(d as any)[idMapper]}/edit`}>编辑</Link>
            );
          }

          actions = actions.map((a, i) => React.cloneElement(a, { key: i }));

          return <Space>{actions}</Space>;
        }}
      />
    );

    return columns;
  };

  return (
    <div>
      <div ref={topDivRef} />
      <Row justify='space-between' style={{ marginBottom: 16 }}>
        <Col>{renderSearchForm()}</Col>
        <Space>
          <Button
            loading={lsInfo.req.state.type === 'loading'}
            disabled={lsInfo.req.state.type === 'loading'}
            onClick={() => lsInfo.req.refresh(lsInfo.req.lastQuery()!)}
          >
            刷新
          </Button>
          {createService && (
            <Link to={routerPrefix + '/' + entity + '/new'}>
              <Button type='primary'>新建</Button>
            </Link>
          )}
        </Space>
      </Row>
      <Table
        rowKey='id'
        size='small'
        dataSource={lsInfo.pageData?.list}
        loading={lsInfo.req.state.type === 'loading'}
        pagination={{
          total: lsInfo.pageData?.total,
          pageSize: lsInfo.pageData?.pageSize,
          current: lsInfo.pageData?.pageNum,
          onChange: (pageNum, pageSize) => handleRefresh({ pageNum, pageSize }),
        }}
      >
        {renderColumns()}
      </Table>
    </div>
  );
};
