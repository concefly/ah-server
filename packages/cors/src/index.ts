import { BaseExtension } from 'ah-server';
import * as cors from '@koa/cors';

export class CorsExtension extends BaseExtension {
  constructor(private opts?: cors.Options) {
    super();
  }

  getMiddleware() {
    return [cors(this.opts)];
  }
}
