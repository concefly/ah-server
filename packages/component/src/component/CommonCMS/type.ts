import { Schema } from 'ah-api-type';
import { RichSchema } from './RichSchema';
import { IDataFormatterProps } from './DataFormatter';

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
