import React from 'react';
import { Schema } from 'jsonschema';
import { IUseRequestRet } from '../../hook/useRequest';
import { RichSchema } from './RichSchema';
import { IDataFormatterProps } from './DataFormatter';

export type ISchemaFormatter = {
  ui?: {
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
};

export interface IPagination<D> {
  total: number;
  pageSize: number;
  pageNum: number;
  list: D[];
}

export interface ICMSProps {
  routerPrefix: string;
  entity: string;
  idMapper?: string;
  render?(content: any): any;

  customRender?: {
    detail?: any;
    dataFormatter?(ctx: IDataFormatterProps): any;
    label?(ctx: { rootSchema: RichSchema; follow: string; schema: RichSchema }): string | undefined;
  };

  listService: IApiService;
  createService?: IApiService;
  updateService?: IApiService;
  readService?: IApiService;
  deleteService?: IApiService;
}

// TODO: 移到 api-generator
export type IApiService = ((arg: any) => Promise<any>) & {
  $meta: {
    tags?: string[];
    pathName: string;
    method: string;
    description: string;
    query: { schema: Schema };
    response: { schema: Schema };
  };
};
