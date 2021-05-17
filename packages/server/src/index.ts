import 'reflect-metadata';

// for type
import * as Koa from 'koa';
import 'koa-body';

import { Schema } from 'jsonschema';

export interface IApplication {}

/** 来自 app 的 service */
export interface IService {}

/** 来自 extension 的 service */
export interface IExtensionService {}
export interface IMergedService extends IService, IExtensionService {}

export interface IContext extends Koa.Context {}

export type IRouterMethod = 'GET' | 'POST' | 'DELETE' | 'PUT';
export type IMiddleware = (ctx: IContext, next: () => Promise<any>) => Promise<any>;
export interface IRouterMeta {
  path: string;
  method: IRouterMethod | IRouterMethod[];
  middlewares?: IMiddleware[];
  query?: {
    tap?: ((q: any) => any) | 'tryParseIntProperty';
    schema: Schema;
  };
}

export interface IConfig {
  LOCAL_PORT: number;
}

export * from './App';
export * from './Config';
export * from './Controller';
export * from './Service';
export * from './util';
export * from './Scheduler';
export * from './error';
export * from './Event';
export * from './Extension';
export * from './refactor';
