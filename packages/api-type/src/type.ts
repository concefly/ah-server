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
        /** 搜索内容字段，支持 dotPath */
        queryMapper: string;
        /** 搜索结果显示字段，支持 dotPath，默认自动生成的 title */
        resultDisplayMapper?: string;
        /** 搜索结果回填表单字段，支持 dotPath，默认 id */
        fieldValueMapper?: string;
      }
    | { type: 'textarea' }
    | { type: 'never' };

  follow?: string;

  /** 渲染类型 */
  type?: 'timestamp' | 'image' | 'richtext' | 'url' | 'pre';
  renderPipe?: { type: 'truncate'; length?: number }[];

  /** 渲染的时候链接到实体 */
  linkToEntity?: {
    name: string;
    idMapper?: string;
  };
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

export type SchemaString = SchemaBase & {
  type: 'string';
  enum?: string[];
};

/** json schema 子集 */
export type Schema = SchemaObject | SchemaArray | SchemaInteger | SchemaString;
