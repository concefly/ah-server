import { IApplication, IService } from '.';

export abstract class BaseExtension {
  // 只有 service 可以扩展
  abstract getService(app: IApplication): Partial<IService>;
}
