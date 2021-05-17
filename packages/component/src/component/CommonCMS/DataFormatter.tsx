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

  if (uiDef?.follow) {
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

  if (schema.type === 'string' || schema.type === 'integer') {
    if (uiDef?.type === 'image') {
      return <Image src={value} style={style} />;
    }

    if (uiDef?.type === 'richtext') {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: value }}
          style={{ maxHeight: 800, border: '1px solid #ddd', overflow: 'auto', ...style }}
        />
      );
    }

    if (uiDef?.type === 'timestamp') {
      return <time style={style}>{dayjs(value).format('YYYY-MM-DD HH:mm:ss')}</time>;
    }

    if (uiDef?.type === 'pre') {
      return <div style={{ margin: 0, whiteSpace: 'pre-line', ...style }}>{value}</div>;
    }

    // 实体超链接
    if (uiDef?.linkToEntity) {
      const targetEntityProps = listCtx.find(c => c.entity === uiDef.linkToEntity?.name);

      if (targetEntityProps) {
        const popoverContent = (
          <CMSContext.Provider value={targetEntityProps}>
            <div style={{ width: 300 }}>
              <SimpleDetail id={value} />
            </div>
          </CMSContext.Provider>
        );

        return (
          <Popover content={popoverContent}>
            <Link to={`/${uiDef.linkToEntity.name}/${value}`} style={style}>
              {value}
            </Link>
          </Popover>
        );
      }
    }

    let pipeResult = value as string | number;

    // renderPipe
    if (uiDef?.renderPipe) {
      uiDef.renderPipe.forEach(pipe => {
        if (pipe.type === 'truncate') {
          pipeResult = _.truncate(pipeResult + '', { length: pipe.length || 20 });
        }
      });
    }

    return <Text style={style}>{pipeResult}</Text>;
  }

  return <pre style={style}>{JSON.stringify(value, null, 2)}</pre>;
};
