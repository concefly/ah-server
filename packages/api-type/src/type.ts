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
};

export type SchemaBase = {
  title?: string;
  description?: string;
  __ui?: SchemaUi;
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
  | SchemaObject
  | SchemaArray
  | SchemaInteger
  | SchemaNumber
  | SchemaString
  | SchemaBoolean;
