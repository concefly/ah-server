import { IApplication } from '.';

export class Service {
  readonly name = this.constructor.name;

  protected get config() {
    return this.app.config;
  }

  protected get service() {
    return this.app.service;
  }

  protected get logger() {
    return this.app.logger.extend(this.name);
  }

  constructor(protected readonly app: IApplication) {}

  init?(): Promise<void>;
}
