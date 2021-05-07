import { IApplication, IMiddleware, IService } from '.';

export abstract class BaseExtension {
  getService(_app: IApplication): Partial<IService> {
    return {};
  }

  getMiddleware(): IMiddleware[] {
    return [];
  }
}
