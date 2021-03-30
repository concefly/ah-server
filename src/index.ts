import 'koa';
import { DefaultContext, DefaultState, ParameterizedContext } from 'koa';

export interface IApplication {}
export interface IService {}

export interface IContext extends ParameterizedContext<DefaultState, DefaultContext> {}
export interface IConfig {
  LOCAL_PORT: number;
}

// fix koa plugin type
declare module 'koa' {
  interface Request {
    // koaBody type
    body?: any;
  }
}

export * from './App';
export * from './Config';
export * from './Logger';
export * from './Controller';
export * from './Service';
export * from './util';
export * from './Scheduler';
export * from './error';
