import React, { useRef, useLayoutEffect } from 'react';
import { SchemaUi } from 'ah-api-type';
import { Pie, Line, Column } from '@antv/g2plot';
import _ from 'lodash';
import { Card } from 'antd';

type IPanelDef = NonNullable<SchemaUi['analyze']>['panels'][0];

export interface IChartCardProps {
  panelDef: IPanelDef;
  data: any;
}

export const ChartCard = ({ panelDef, data }: IChartCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => drawPlot(), []);

  const drawPlot = () => {
    if (!containerRef.current) return;

    const defaultOpt = {
      height: 300,
      data: panelDef.dataIndex ? _.get(data, panelDef.dataIndex) : data,
    };

    if (panelDef.type === 'Pie') {
      const chart = new Pie(containerRef.current, {
        ...defaultOpt,
        appendPadding: 24,
        colorField: panelDef.colorField || 'type',
        angleField: panelDef.angleField || 'value',
      });

      chart.render();
      return () => chart.destroy();
    }

    if (panelDef.type === 'Line') {
      const chart = new Line(containerRef.current, {
        ...defaultOpt,
        xField: panelDef.xField,
        yField: panelDef.yField,
      });

      chart.render();
      return () => chart.destroy();
    }

    if (panelDef.type === 'Column') {
      const chart = new Column(containerRef.current, {
        ...defaultOpt,
        xField: panelDef.xField,
        yField: panelDef.yField,
      });

      chart.render();
      return () => chart.destroy();
    }
  };

  return (
    <Card title={panelDef.title || panelDef.type} style={{ width: '100%' }}>
      <div ref={containerRef} />
    </Card>
  );
};
