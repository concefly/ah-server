import React, { useEffect, useState } from 'react';
import { Button, Col, Row, Space, Table, Typography } from 'antd';
import { Schema } from 'jsonschema';
import { useRequest } from '../../hook/useRequest';
import { ICRUDProps, IDType, IPagination } from './type';
import { Link } from 'react-router-dom';
import { __ } from './locale';

const { Text } = Typography;

export interface IListService<Q, D> {
  query: {
    schema: Schema;
  };
  response: {
    schema: Schema;
  };
  invoke: (q: Q) => Promise<IPagination<D>>;
}

export interface IListProps<Q, D> {
  /** 路由前缀 */
  routerPrefix: string;
  service: IListService<Q, D>;
  extraActions?: () => any[];
}

export interface IListBaseQ {
  pageSize?: number;
  pageNum?: number;
}

export interface IListBaseD {
  id: IDType;
}

export const List = <IndexQ, D extends { id: any }>({
  routerPrefix = '',
  listService: list,
}: ICRUDProps<IndexQ, D>) => {
  const req = useRequest<IndexQ, IPagination<D>>(q => list.invoke(q));

  // 这是为了防止 table 翻页时闪屏
  const [data, setData] = useState<IPagination<D>>(
    req.state.type === 'success' ? req.state.data : { total: 0, pageSize: 0, pageNum: 0, list: [] }
  );

  useEffect(() => {
    req.refresh({} as any);
  }, []);

  useEffect(() => {
    if (req.state.type === 'success') setData(req.state.data);
  }, [req.state.type]);

  const renderColumns = () => {
    let columns: any[] = [];

    // FIXME: 这里靠 ts 类型约束 schema 结构
    if ((list.response.schema.properties?.list?.items as Schema)?.properties) {
      const properties = (list.response.schema.properties?.list?.items as Schema)?.properties!;

      // object 类型 -> 每个字段占一列
      Object.entries(properties).forEach(([name, schema]) => {
        columns.push(
          <Table.Column
            title={schema.title || __(name)}
            dataIndex={name}
            render={(d: any) => {
              if (schema.type === 'string' || schema.type === 'number') {
                return <Text>{d}</Text>;
              }
              return <pre>{JSON.stringify(d)}</pre>;
            }}
          />
        );
      });
    }

    // 插入 action
    columns.push(
      <Table.Column
        title='操作'
        dataIndex='$$action'
        render={(_, d: D) => {
          let actions: any[] = [
            <Link to={`${routerPrefix}/${d.id}`}>查看</Link>,
            <Link to={`${routerPrefix}/${d.id}/edit`}>编辑</Link>,
          ];

          actions = actions.map((a, i) => React.cloneElement(a, { key: i }));

          return <Space>{actions}</Space>;
        }}
      />
    );

    return columns.map(c => React.cloneElement(c, { key: c.props.dataIndex }));
  };

  return (
    <div>
      <Row justify='space-between' style={{ marginBottom: 16 }}>
        <Col></Col>
        <Space>
          <Button
            loading={req.state.type === 'loading'}
            disabled={req.state.type === 'loading'}
            onClick={() => req.refresh(req.lastQuery()!)}
          >
            刷新
          </Button>
          <Link to={routerPrefix + '/new'}>
            <Button type='primary'>新建</Button>
          </Link>
        </Space>
      </Row>
      <Table
        rowKey='id'
        size='small'
        dataSource={data.list}
        loading={req.state.type === 'loading'}
        pagination={{
          total: data.total,
          pageSize: data.pageSize,
          current: data.pageNum,
          onChange: (pageNum, pageSize) => {
            req.refresh({ ...req.lastQuery()!, pageNum, pageSize });
          },
        }}
      >
        {renderColumns()}
      </Table>
    </div>
  );
};
