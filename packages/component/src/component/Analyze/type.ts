import { IApiService } from 'ah-api-type';

export type IInspectItem = {
  service: IApiService<any, any>;
};

export type IInspectMap = Record<string, IInspectItem>;

export type IAnalyzeProps = {
  routerPrefix: string;
  entityMap: Record<string, IInspectMap>;
};
