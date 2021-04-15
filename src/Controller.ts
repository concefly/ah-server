import { Schema } from 'jsonschema';
import { IContext } from '.';
import { BaseService } from './Service';

export type IRouterMethod = 'GET' | 'POST' | 'DELETE' | 'PUT';
export type IMiddleware = (ctx: IContext, next: () => Promise<any>) => void;

export type IControllerMapperItem = {
  path: string;
  method: IRouterMethod | IRouterMethod[];
  handler: (ctx: IContext, query?: any) => Promise<any>;
  middlewares?: IMiddleware[];
  query?: { schema: Schema };
};

export abstract class BaseController extends BaseService {
  abstract readonly mapper: IControllerMapperItem[];
}
