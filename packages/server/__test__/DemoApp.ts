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
    await new Promise(resolve => setTimeout(resolve, 500));
    return output;
  }
}

class HomeController extends BaseController {
  mapper: IControllerMapperItem[] = [
    {
      path: '/',
      method: ['GET'],
      handler: this.index,
    },
  ];

  async index(ctx: IContext) {
    ctx.body = '<h1>Hi</h1>';
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
    echo: new EchoService(this),
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
