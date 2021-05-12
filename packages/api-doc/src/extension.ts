import { BaseExtension, IApplication } from 'ah-server';
import { ApiDocService } from './service';
import { Schema } from 'jsonschema';

export class ApiDocExtension extends BaseExtension {
  constructor(private components?: { [name: string]: Schema }) {
    super();
  }

  getService(app: IApplication) {
    return {
      apiDoc: new ApiDocService(app, this.components),
    };
  }
}
