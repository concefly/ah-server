import { BaseExtension, IApplication } from 'ah-server';
import { ApiDocService } from './service';
import { Schema } from 'ah-api-type';

export class ApiDocExtension extends BaseExtension {
  constructor(private components?: { [name: string]: Schema }) {
    super();
  }

  getService(app: IApplication) {
    const apiDoc = new ApiDocService(app);
    apiDoc.components = this.components;

    return { apiDoc };
  }
}
