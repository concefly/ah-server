import { IApplication, IMergedService } from '.';

export class BaseService {
  readonly name = this.constructor.name;

  constructor(protected readonly app: IApplication) {}

  protected get config() {
    return this.app.config;
  }

  protected get service() {
    // FIXME: app.service 合并了 extension 提供的 service
    return this.app.service as IMergedService;
  }

  protected logger = this.app.logger.extend(this.name);
}
