import React, { useRef, useEffect } from 'react';
import { useInspectContext, useLogger } from '../hook';
import { Card, Row, Col } from 'antd';
import { ChartCard } from './ChartCard';
import { useRequest } from 'ah-hook';
import _ from 'lodash';
import { ErrorBoundary } from 'react-error-boundary';
import { SchemaHelper } from '../../CommonCMS';

export const Panel = () => {
  const logger = useLogger('Panel');

  const ctx = useInspectContext();
  const dataReq = useRequest(ctx.service);

  const schema = ctx.service.$meta?.response.schema
    ? SchemaHelper.getByDataDotPath(ctx.service.$meta.response.schema, 'data')
    : undefined;

  const analyzeDef = schema ? SchemaHelper.getUiDef(schema)?.analyze : undefined;

  useEffect(() => analyzeDef && dataReq.refresh({}).cancel, []);

  if (!analyzeDef) {
    logger.error('no analyzeSchema, skip');
    return null;
  }

  return (
    <div>
      {dataReq.state.type === 'loading' && '载入中...'}
      {dataReq.state.type === 'success' && (
        <Row gutter={16}>
          {analyzeDef.panels.map((panelDef, i) => (
            <Col key={panelDef.title || i} span={panelDef.span || 8} style={{ marginBottom: 16 }}>
              <ErrorBoundary fallbackRender={fp => <span>加载失败: {fp.error.message}</span>}>
                <ChartCard
                  panelDef={panelDef}
                  data={dataReq.state.type === 'success' && dataReq.state.data.data}
                />
              </ErrorBoundary>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};
