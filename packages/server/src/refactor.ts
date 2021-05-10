import { IRouterMeta } from '.';

export const MetaKey = {
  route: 'ah:design:route',
};

/** 路由装饰器 */
export const router = (meta: IRouterMeta) => Reflect.metadata(MetaKey.route, meta);
export const getRouterMeta = (target: any, property: string): IRouterMeta | undefined =>
  Reflect.getMetadata(MetaKey.route, target, property);
