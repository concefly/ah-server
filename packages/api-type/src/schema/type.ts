export type SchemaUi = {
  list?: {
    columns?: string[];
  };
  detail?: {
    columns?: string[];
    split?: string[];
  };
  editor?: {
    columns?: string[];
  };

  hideInForm?: boolean;

  /** 表单字段定义 */
  formField?:
    | {
        type: 'select';
        /** 搜索实体 */
        entity: string;
        /** 搜索 url query 字段 */
        queryMapper: string;
        /** 搜索结果显示字段，支持 dotPath，默认自动生成的 title */
        resultDisplayMapper?: string;
        /** 搜索结果回填表单字段，支持 dotPath，默认 id */
        fieldValueMapper?: string;
      }
    | {
        type: 'datepicker';
        showTime?: boolean;
      }
    | { type: 'textarea' }
    | { type: 'richtext' };

  follow?: string;

  /** 渲染格式化 */
  format?:
    | { type: 'timestamp' }
    | { type: 'image' }
    | { type: 'richtext'; pre?: boolean }
    | { type: 'url' }
    | { type: 'template'; template: string; richtext?: boolean };

  /** 渲染的时候链接到实体
   * - 适用于 string, integer, object
   */
  linkToEntity?: {
    name: string;

    /** 查询字段
     * - object 默认映射成 id, 支持 dotPath
     * - string, integer 无效
     */
    queryMapper?: string;

    /** 内容显示字段，支持
     * - object 默认自动生成 title
     * - string, integer 默认显示自身值
     */
    displayMapper?: string;
  };

  /** 自定义标签 */
  tags?: string[];

  /** 数据分析渲染 */
  analyze?: {
    panels: ((
      | {
          type: 'Pie';
          /** 颜色映射字段, 默认 type */
          colorField?: string;
          /** 角度映射字段, 默认 value */
          angleField?: string;
        }
      | {
          type: 'Line';
          /** x 轴字段 */
          xField: string;
          /** y 轴字段 */
          yField: string;
        }
      | {
          /** 柱形图 */
          type: 'Column';
          /** x 轴字段 */
          xField: string;
          /** y 轴字段 */
          yField: string;
        }
    ) & {
      title?: string;
      dataIndex?: string;
      /** 占据宽度，最大 24，默认 8 */
      span?: number;
    })[];
  };
};

export type SchemaBase = {
  title?: string;
  description?: string;
  __ui?: SchemaUi;
};

export type SchemaOneOf = SchemaBase & {
  oneOf: Schema[];
};

export type SchemaObject = SchemaBase & {
  type: 'object';
  properties?: {
    [name: string]: Schema;
  };
  required?: string[];
};

export type SchemaArray = SchemaBase & {
  type: 'array';
  items?: Schema;
};

export type SchemaInteger = SchemaBase & {
  type: 'integer';
  enum?: number[];
};

export type SchemaNumber = SchemaBase & {
  type: 'number';
  enum?: number[];
};

export type SchemaString = SchemaBase & {
  type: 'string';
  enum?: string[];
};

export type SchemaBoolean = SchemaBase & {
  type: 'boolean';
};

/** json schema 子集 */
export type Schema =
  | SchemaOneOf
  | SchemaObject
  | SchemaArray
  | SchemaInteger
  | SchemaNumber
  | SchemaString
  | SchemaBoolean;

// type guard
export const isSchemaOneOf = (s: Schema): s is SchemaOneOf => 'oneOf' in s;

export const isSchemaObject = (s: Schema): s is SchemaObject =>
  !isSchemaOneOf(s) && s.type === 'object';

export const isSchemaArray = (s: Schema): s is SchemaArray =>
  !isSchemaOneOf(s) && s.type === 'array';

export const isSchemaInteger = (s: Schema): s is SchemaInteger =>
  !isSchemaOneOf(s) && s.type === 'integer';

export const isSchemaNumber = (s: Schema): s is SchemaNumber =>
  !isSchemaOneOf(s) && s.type === 'number';

export const isSchemaString = (s: Schema): s is SchemaString =>
  !isSchemaOneOf(s) && s.type === 'string';

export const isSchemaBoolean = (s: Schema): s is SchemaBoolean =>
  !isSchemaOneOf(s) && s.type === 'boolean';
