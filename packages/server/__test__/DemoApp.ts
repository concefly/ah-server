import {
  BaseApp,
  BaseController,
  IContext,
  IRouterMeta,
  IService,
  BaseService,
  IMiddleware,
} from '../src';

class InspectService extends BaseService {
  echo(text: string) {
    return text;
  }
}

class EchoController extends BaseController {
  mapper: IRouterMeta[] = [
    {
      path: '/echo',
      method: ['GET', 'POST'],
      handler: this.echo,
      query: {
        schema: {
          type: 'object',
          properties: { text: { type: 'string' } },
        },
      },
    },
  ];

  async echo(_ctx: IContext, q: { text?: string }) {
    const output = (this.service as any).inspect.echo(q.text);
    await new Promise(resolve => setTimeout(resolve, 500));
    return output;
  }
}

class HomeController extends BaseController {
  mapper: IRouterMeta[] = [
    {
      path: '/',
      method: ['GET'],
      handler: this.index,
    },
    {
      path: '/file',
      method: ['POST'],
      handler: this.uploadFile,
      query: {
        schema: {
          type: 'object',
          properties: {
            a: { type: 'string' },
            file: {
              type: 'object',
              properties: { path: { type: 'string' } },
              required: ['path'],
            },
          },
          required: ['a'],
        },
      },
    },
  ];

  async index(ctx: IContext) {
    ctx.body = '<h1>Hi</h1>';
  }

  async uploadFile(_ctx: IContext, q: { a: string; file: { path: string } }) {
    return q;
  }
}

const testMiddlewareA: IMiddleware = async (ctx, next) => {
  ctx.response.set({ 'x-a': 'a' });
  return next();
};

const testMiddlewareB: IMiddleware = async (ctx, next) => {
  ctx.response.set({ 'x-b': 'b' });
  return next();
};

export class TestApp extends BaseApp {
  service: IService = {
    inspect: new InspectService(this),
  };
  controllers: BaseController[] = [new HomeController(this), new EchoController(this)];
  schedulers = [];
  middlewares = [testMiddlewareA, testMiddlewareB];
  logger = {
    info(msg: string) {
      console.log(msg);
    },
    error(msg: string) {
      throw new Error(msg);
    },
  } as any;
}
