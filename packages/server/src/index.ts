// for type
import * as Koa from 'koa';
import 'koa-body';

import { Schema } from 'jsonschema';

export interface IApplication {}
export interface IService {}

export interface IContext extends Koa.Context {}

export type IRouterMethod = 'GET' | 'POST' | 'DELETE' | 'PUT';
export type IMiddleware = (ctx: IContext, next: () => Promise<any>) => Promise<any>;
export interface IRouterMeta {
  path: string;
  method: IRouterMethod | IRouterMethod[];
  handler: (ctx: IContext, query?: any) => Promise<any>;
  middlewares?: IMiddleware[];
  query?: { schema: Schema };
}

export interface IConfig {
  LOCAL_PORT: number;
}

// fix koa plugin type
// declare module 'koa' {
//   interface Request {
//     // koaBody type
//     body?: any;
//   }
// }

export * from './App';
export * from './Config';
export * from './Controller';
export * from './Service';
export * from './util';
export * from './Scheduler';
export * from './error';
export * from './Event';
export * from './Extension';
