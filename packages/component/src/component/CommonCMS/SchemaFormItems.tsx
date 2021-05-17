import React from 'react';
import { Button, Col, Form, Input, InputNumber, Row, Select } from 'antd';
import { RichSchema } from './RichSchema';
import { CMSContext, useCMSContext } from './context';
import { useLabelRender } from './hook';
import { FieldSelect } from './Field/Select';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

export interface ISchemaFormProps {
  /** form 顶层 schema */
  rootSchema: RichSchema;

  /** 当前 schema */
  schema?: RichSchema;

  /** 当前字段 dotPath */
  dotPath?: string[];

  /** 当前字段 required */
  required?: boolean;

  fieldTail?: any;

  /** 这个是 Form.List 要用的数据 */
  __listFieldData?: FormListFieldData;
}

export const SchemaFormItems = ({
  rootSchema,
  schema = rootSchema,
  dotPath = [],
  required,
  fieldTail,
  __listFieldData,
}: ISchemaFormProps): any => {
  const { idMapper = 'id' } = useCMSContext();
  const labelRender = useLabelRender();

  const uiDef = schema.getUiDef();

  // idMapper 比较特殊，对比 dotPath 顶层
  const hidden = uiDef?.hideInForm || dotPath[0] === idMapper;
  const label = labelRender({ rootSchema, follow: dotPath.join('.'), schema }) || dotPath.join('.');

  // FIXME: 复杂类型的 list field 未验证，先不做处理
  if (!__listFieldData) {
    // object，一般是第一层
    if (schema.type === 'object' && schema.properties) {
      return Object.entries(schema.properties).map(([pKey, pSchema]) => {
        return (
          <SchemaFormItems
            key={pKey}
            rootSchema={rootSchema}
            schema={pSchema}
            dotPath={[...dotPath, pKey]}
            required={schema.required?.includes(pKey)}
          />
        );
      });
    }

    // array，一般是从 object 递归下来的
    if (schema.type === 'array' && schema.items) {
      return (
        <Form.List name={dotPath}>
          {(fields, { remove, add }, { errors }) => {
            return (
              <>
                {fields.map((field, i) => {
                  return (
                    <SchemaFormItems
                      key={field.key}
                      rootSchema={rootSchema}
                      schema={schema.items}
                      dotPath={[...dotPath, field.name + '']}
                      __listFieldData={field}
                      fieldTail={
                        <>
                          {fields.length > 1 && (
                            <MinusCircleOutlined onClick={() => remove(field.name)} />
                          )}
                        </>
                      }
                    />
                  );
                })}
                <Form.Item>
                  <Button type='dashed' onClick={() => add()} icon={<PlusOutlined />}>
                    {label}
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            );
          }}
        </Form.List>
      );
    }
  }

  // 其他基本类型
  const formField = uiDef?.formField;

  const filed = formField ? (
    formField.type === 'select' ? (
      <FieldSelect {...formField} />
    ) : formField.type === 'textarea' ? (
      <Input.TextArea autoSize style={{ width: '100%' }} allowClear />
    ) : null
  ) : (
    <Input style={{ width: '100%' }} allowClear />
  );

  uiDef?.formField?.type === 'select' ? (
    <FieldSelect {...uiDef.formField} />
  ) : schema.type === 'integer' ? (
    <InputNumber style={{ width: '100%' }} />
  ) : (
    <Input style={{ width: '100%' }} allowClear />
  );

  // list field 特殊处理(和 antd 内部 item dotPath 逻辑有关)
  const innerFiledItem = __listFieldData ? (
    <Form.Item {...__listFieldData} noStyle>
      {filed}
    </Form.Item>
  ) : (
    <Form.Item name={dotPath} noStyle>
      {filed}
    </Form.Item>
  );

  return (
    <Form.Item
      label={label}
      hidden={hidden}
      required={required}
      rules={[{ required, message: `请填写 ${label}` }]}
    >
      {fieldTail ? (
        <Row gutter={8} align='middle'>
          <Col span={20}>{innerFiledItem}</Col>
          <Col span={4}>{fieldTail}</Col>
        </Row>
      ) : (
        innerFiledItem
      )}
    </Form.Item>
  );
};
