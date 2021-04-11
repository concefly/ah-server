import { Schema } from 'jsonschema';
import { IContext } from '.';
import { BaseService } from './Service';

type IRouterMethod = 'GET' | 'POST' | 'DELETE' | 'PUT';

export type IControllerMapperItem = {
  path: string;
  method: IRouterMethod | IRouterMethod[];
  handler: (ctx: IContext, query?: any) => Promise<any>;
  query?: { schema: Schema };
};

export abstract class BaseController extends BaseService {
  abstract readonly mapper: IControllerMapperItem[];
}
