import {
  BaseApp,
  BaseController,
  IContext,
  IControllerMapperItem,
  IService,
  BaseService,
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

export class TestApp extends BaseApp {
  service: IService = {
    echo: new EchoService(this),
  };
  controllerList: BaseController[] = [new EchoController(this)];
  schedulerList = [];
  logger = {
    info() {},
    error(msg: string) {
      throw new Error(msg);
    },
  } as any;
}
