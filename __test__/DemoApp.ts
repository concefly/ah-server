import { App, Controller, IContext, IControllerMapperItem, IService, Service } from '../src';

class EchoService extends Service {
  echo(text: string) {
    return text;
  }
}

class EchoController extends Controller {
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

export class TestApp extends App {
  service: IService = {
    echo: new EchoService(this),
  };
  controllerList: Controller[] = [new EchoController(this)];
  schedulerList = [];
  logger = {
    info() {},
    error(msg: string) {
      throw new Error(msg);
    },
  } as any;
}
