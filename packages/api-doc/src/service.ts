import { BaseService } from 'ah-server';
import { generateRouterMetaInfo } from './router';
import * as _ from 'lodash';

export class ApiDocService extends BaseService {
  getApiDoc(opt: { version: string; services: { url: string }[] }) {
    return generateRouterMetaInfo(_.flatten(this.app.controllers.map(c => c.mapper)), opt);
  }
}
