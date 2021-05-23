import React from 'react';
import dayjs from 'dayjs';
import { Typography, Image, Popover, Tag } from 'antd';
import { RichSchema } from './RichSchema';
import _ from 'lodash';
import { CMSContext, useCMSContext, useCMSListContext } from './context';
import { Link } from 'react-router-dom';
import { SimpleDetail } from './SimpleDetail';

const { Text } = Typography;

export interface IDataFormatterProps {
  rootValue: any;
  follow: string;
  value: any;
  schema: RichSchema;
  style?: React.CSSProperties;
}

export const DataFormatter = ({ rootValue, follow, value, schema, style }: IDataFormatterProps) => {
  const ctx = useCMSContext();
  const listCtx = useCMSListContext();

  // 自定义渲染
  if (ctx.customRender?.dataFormatter) {
    const ret = ctx.customRender.dataFormatter({ rootValue, follow, value, schema, style });
    // 如果是 `false` 就 skip 继续渲染
    if (ret !== false) return ret;
  }

  if (typeof value === 'undefined') return <Text type='secondary'>(未定义)</Text>;

  const uiDef = schema.getUiDef();

  // 处理 uiDef
  if (uiDef) {
    if (uiDef.follow) {
      const nextSchema = schema.getByDataDotPath(uiDef.follow);
      if (nextSchema) {
        return (
          <DataFormatter
            rootValue={rootValue}
            follow={[follow, uiDef.follow].join('.')}
            value={_.get(value, uiDef.follow)}
            schema={nextSchema}
            style={style}
          />
        );
      }
    }

    // 实体超链接
    if (uiDef.linkToEntity) {
      const targetEntityProps = listCtx.find(c => c.entity === uiDef.linkToEntity!.name);

      if (targetEntityProps) {
        const detailQueryId =
          schema.type === 'object'
            ? _.get(value, uiDef.linkToEntity.queryMapper || 'id')
            : schema.type === 'string' || schema.type === 'integer'
            ? value
            : undefined;

        const displayText =
          schema.type === 'string' || schema.type === 'integer'
            ? value
            : schema.getTitleGenerator()?.(value) || '点击前往';

        const popoverContent = (
          <CMSContext.Provider value={targetEntityProps}>
            <div style={{ width: 300 }}>{detailQueryId && <SimpleDetail id={detailQueryId} />}</div>
          </CMSContext.Provider>
        );

        return (
          <Popover content={popoverContent}>
            <Link to={`/${uiDef.linkToEntity.name}/${detailQueryId}`} style={style}>
              {displayText}
            </Link>
          </Popover>
        );
      }
    }

    // 格式化
    if (uiDef.format) {
      // image
      if (uiDef.format.type === 'image') return <Image src={value} style={style} />;

      // url
      if (uiDef.format.type === 'url') {
        return (
          <a target='_blank' href={value} style={style}>
            {value}
          </a>
        );
      }

      // richtext
      if (uiDef.format.type === 'richtext') {
        return (
          <div
            dangerouslySetInnerHTML={{ __html: value }}
            style={{
              maxHeight: 800,
              border: '1px solid #ddd',
              overflow: 'auto',
              ...(uiDef.format.pre && { whiteSpace: 'pre-line' }),
              ...style,
            }}
          />
        );
      }

      // timestamp
      if (uiDef.format.type === 'timestamp') {
        return (
          <Text code style={style}>
            <time style={style}>{dayjs(value).format('YYYY-MM-DD HH:mm:ss')}</time>
          </Text>
        );
      }

      // template
      if (uiDef.format.type === 'template') {
        const renderData =
          schema.type === 'object' ? value : schema.type === 'array' ? { list: value } : value + '';

        if (typeof renderData === 'string') return <Text style={style}>{renderData}</Text>;

        const tplRender = new Function(
          ...Object.keys(renderData),
          `return \`${uiDef.format.template}\`;`
        );

        const body = tplRender(...Object.values(renderData));

        return uiDef.format.richtext ? (
          <div
            dangerouslySetInnerHTML={{ __html: body }}
            style={{
              maxHeight: 800,
              border: '1px solid #ddd',
              overflow: 'auto',
              ...style,
            }}
          />
        ) : (
          <Text style={style}>{body}</Text>
        );
      }
    }
  }

  // array 类型
  if (schema.type === 'array' && schema.items && Array.isArray(value)) {
    // string[] 的效果特殊处理下
    if (schema.items.type === 'string') {
      return value.map((v, i) => <Tag key={i}>{v}</Tag>);
    }

    return (
      <div style={style}>
        {value.map((item, i) => (
          <div key={i}>
            <DataFormatter
              rootValue={rootValue}
              follow={[follow, i].join('.')}
              schema={schema.items!}
              value={item}
            />
            <hr />
          </div>
        ))}
      </div>
    );
  }

  // 处理基本类型
  if (schema.type === 'string' || schema.type === 'integer') {
    return <Text style={style}>{value}</Text>;
  }

  return <pre style={{ margin: 0, ...style }}>{JSON.stringify(value, null, 2)}</pre>;
};
