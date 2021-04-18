import { BaseExtension, IApplication } from 'ah-server';
import { ApiDocService } from './service';

export class ApiDocExtension extends BaseExtension {
  getService(app: IApplication) {
    return {
      apiDoc: new ApiDocService(app),
    };
  }
}
