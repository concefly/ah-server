import { BaseExtension, IMiddleware } from 'ah-server';
import * as staticServer from 'koa-static';

export class StaticExtension extends BaseExtension {
  constructor(
    readonly list: {
      root: string;
      opt?: staticServer.Options;
    }[]
  ) {
    super();
  }

  getMiddleware(): IMiddleware[] {
    return this.list.map(d => staticServer(d.root, d.opt));
  }
}
