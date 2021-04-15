import {
  BaseApp,
  BaseController,
  IContext,
  IControllerMapperItem,
  IService,
  BaseService,
  IMiddleware,
} from '../src';

class EchoService extends BaseService {
  echo(text: string) {
    return text;
  }
}

class EchoController extends BaseController {
  mapper: IControllerMapperItem[] = [
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
    const output = (this.service as any).echo.echo(q.text);
    return output;
  }
}

const testMiddlewareA: IMiddleware = (ctx, next) => {
  ctx.response.set({ 'x-a': 'a' });
  next();
};

const testMiddlewareB: IMiddleware = (ctx, next) => {
  ctx.response.set({ 'x-b': 'b' });
  next();
};

export class TestApp extends BaseApp {
  service: IService = {
    echo: new EchoService(this),
  };
  controllers: BaseController[] = [new EchoController(this)];
  schedulers = [];
  middlewares = [testMiddlewareA, testMiddlewareB];
  logger = {
    info() {},
    error(msg: string) {
      throw new Error(msg);
    },
  } as any;
}
