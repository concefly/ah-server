import React from 'react';
import { Button, Col, Divider, Form, Input, InputNumber, Radio, Row } from 'antd';
import { RichSchema } from './RichSchema';
import { useCMSContext } from './context';
import { useLabelRender, useLogger } from './hook';
import { FieldSelect } from './Field/Select';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { DatePicker } from './Field/DatePicker';
import _ from 'lodash';
import { Switch } from './Field/Switch';

export interface ISchemaFormProps {
  /** form 顶层 schema */
  rootSchema: RichSchema;

  /** 当前 schema */
  schema?: RichSchema;

  name?: (string | number)[];
  fieldKey?: (string | number)[];
  label?: string[];

  /** 是否 form list **顶层** */
  isListField?: boolean;

  /** 当前字段 required */
  required?: boolean;
}

export const SchemaFormItems = ({
  rootSchema,
  schema = rootSchema,
  name = [],
  fieldKey = name,
  label = [],
  isListField = false,
  required,
}: ISchemaFormProps): any => {
  const labelRender = useLabelRender();
  const { customRender } = useCMSContext();
  const logger = useLogger('SchemaFormItems');

  // 确保 object 是第一层
  if (name.length === 0 && schema.type !== 'object') {
    logger.error('level 0 is not object, skip');
    return null;
  }

  // object，一定要是第一层
  if (schema.type === 'object' && schema.properties) {
    return Object.entries(schema.properties).map(([pKey, pSchema]) => {
      return (
        <SchemaFormItems
          key={pKey}
          rootSchema={rootSchema}
          schema={pSchema}
          name={[...name, pKey]}
          fieldKey={[...fieldKey, pKey]}
          label={[...label, labelRender({ key: pKey, schema: pSchema })]}
          isListField={isListField}
          required={schema.required?.includes(pKey)}
        />
      );
    });
  }

  const uiDef = schema.getUiDef();

  // idMapper 比较特殊，对比 dotPath 顶层
  const hidden = uiDef?.hideInForm;

  // array，一般是从 object 递归下来的
  if (schema.type === 'array' && schema.items) {
    return (
      <div style={{ paddingLeft: 16, borderLeft: '6px solid #bbb' }}>
        <Form.List name={name}>
          {(fields, { remove, add }, { errors }) => {
            return (
              <>
                {fields.map((field, i) => {
                  return (
                    <section
                      key={field.key}
                      style={{
                        padding: 16,
                        border: '1px solid #ccc',
                        marginBottom: 16,
                      }}
                    >
                      <Row>
                        <Col span={20}>
                          <SchemaFormItems
                            rootSchema={rootSchema}
                            schema={schema.items}
                            name={[i]}
                            fieldKey={[i]}
                            label={[...label, i + '']}
                            isListField={true}
                          />
                        </Col>
                        <Col span={4}>
                          {fields.length >= 2 && (
                            <Row align='middle' justify='center' style={{ height: '100%' }}>
                              <Col
                                onClick={() => remove(field.name)}
                                style={{ color: 'red', cursor: 'pointer' }}
                              >
                                <DeleteOutlined /> 删除
                              </Col>
                            </Row>
                          )}
                        </Col>
                      </Row>
                    </section>
                  );
                })}
                <Form.Item>
                  <Button type='dashed' onClick={() => add()} icon={<PlusOutlined />}>
                    {label.join('.')}
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            );
          }}
        </Form.List>
      </div>
    );
  }

  // 其他基本类型
  const formField = uiDef?.formField;

  let filed: any = <Input style={{ width: '100%' }} allowClear />;

  if (customRender?.formField) {
    const ret = customRender.formField({
      rootSchema,
      schema,
      name,
      fieldKey,
      label,
      isListField,
      required,
    });
    if (ret !== false) filed = ret;
  } else if (formField) {
    // 1. 判断 formField
    if (formField.type === 'select')
      filed = <FieldSelect {...formField} style={{ minWidth: 200 }} />;
    else if (formField.type === 'textarea') {
      filed = <Input.TextArea autoSize style={{ width: '100%' }} allowClear />;
    } else if (formField.type === 'datepicker') {
      filed = <DatePicker showTime={formField.showTime} />;
    }
    //
  } else if (uiDef) {
    // 2. 判断 format
    if (uiDef.format) {
      if (uiDef.format.type === 'timestamp') {
        filed = <DatePicker showTime />;
      }
    }
  } else {
    // 3. 判断基本类型
    if (schema.type === 'string' || schema.type === 'integer') {
      if (schema.enum) {
        filed = (
          <Radio.Group>
            {schema.enum.map((v: any) => (
              <React.Fragment key={v}>
                <Radio value={v}>{labelRender({ key: v })}</Radio>
              </React.Fragment>
            ))}
          </Radio.Group>
        );
      } else {
        filed =
          schema.type === 'string' ? (
            <Input style={{ width: '100%' }} allowClear />
          ) : (
            <InputNumber style={{ width: '100%' }} />
          );
      }
    } else if (schema.type === 'boolean') {
      filed = <Switch />;
    }
  }

  return (
    <Form.Item
      label={label.join('.')}
      hidden={hidden}
      required={required}
      name={name}
      fieldKey={fieldKey}
      isListField={isListField}
      rules={[{ required, message: `请填写 ${label.join('.')}` }]}
    >
      {filed}
    </Form.Item>
  );
};
