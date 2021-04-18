import { IRouterMeta } from '.';
import { BaseService } from './Service';

/** @deprecated use `IControllerMeta` instead */
export type IControllerMapperItem = IRouterMeta;

export abstract class BaseController extends BaseService {
  abstract readonly mapper: IRouterMeta[];
}
