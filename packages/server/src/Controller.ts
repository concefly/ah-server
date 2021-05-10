import { IRouterMeta } from '.';
import { BaseService } from './Service';

/** @deprecated use `IControllerMeta` instead */
export type IControllerMapperItem = IRouterMeta;

export abstract class BaseController extends BaseService {
  /** @deprecated 改用 router 装饰器 */
  readonly mapper?: IRouterMeta[];
}
