import { Schema } from 'ah-api-type';
import { IDataFormatterProps } from './DataFormatter';
import { ISchemaFormProps } from './SchemaFormItems';
import { FormProps } from 'antd';
import { useCreateServiceInfo, useReadServiceInfo, useUpdateServiceInfo } from './hook';

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
    detailAction?(ctx: {
      cmsProps: ICMSProps;
      rsInfo: NonNullable<ReturnType<typeof useReadServiceInfo>>;
    }): any;
    dataFormatter?(ctx: IDataFormatterProps): any;
    formField?(ctx: ISchemaFormProps): any;
    form?(ctx: {
      formProps: FormProps;
      rsInfo?: ReturnType<typeof useReadServiceInfo>;
      csInfo?: ReturnType<typeof useCreateServiceInfo>;
      usInfo?: ReturnType<typeof useUpdateServiceInfo>;
    }): any;
    label?(ctx: { key: string; schema?: Schema }): string | undefined;
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
