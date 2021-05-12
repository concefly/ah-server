import React from 'react';
import { Schema } from 'jsonschema';
import { Button, Form, Input, InputNumber, message, Spin } from 'antd';
import { __ } from './locale';

export interface ISchemaFormProps {
  schema: Schema;
}

export const SchemaFormItems = ({ schema }: ISchemaFormProps) => {
  const renderItems = () => {
    let items: any[] = [];

    if (schema.type === 'object' && schema.properties) {
      Object.entries(schema.properties).map(([vKey, vSchema]) => {
        const required = schema.required
          ? typeof schema.required === 'boolean'
            ? schema.required
            : schema.required.includes(vKey)
          : false;

        const label = vSchema.title || __(vKey);

        items.push(
          <Form.Item
            key={vKey}
            name={vKey}
            label={label}
            hidden={vKey === 'id'}
            required={required}
            rules={[{ required, message: `请填写 ${label}` }]}
          >
            {vSchema.type === 'integer' ? (
              <InputNumber style={{ width: '100%' }} />
            ) : (
              <Input style={{ width: '100%' }} />
            )}
          </Form.Item>
        );
      });
    }

    return items;
  };

  return renderItems() as any;
};
