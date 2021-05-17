import { IApplication, IMiddleware, IExtensionService } from '.';

export abstract class BaseExtension {
  getService(_app: IApplication): Partial<IExtensionService> {
    return {};
  }

  getMiddleware(): IMiddleware[] {
    return [];
  }
}
