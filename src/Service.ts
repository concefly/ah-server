import { IApplication } from '.';

export class BaseService {
  readonly name = this.constructor.name;

  constructor(protected readonly app: IApplication) {}

  protected get config() {
    return this.app.config;
  }

  protected get service() {
    return this.app.service;
  }

  protected logger = this.app.logger.extend(this.name);

  init?(): Promise<void>;
}

/** @deprecated */
export const Service = BaseService;
