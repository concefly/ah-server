import { BaseService } from 'ah-server';
import { generateRouterMetaInfo, IRouterMetaExt } from './router';
import * as _ from 'lodash';

export class ApiDocService extends BaseService {
  getApiDoc(opt: { version: string; services: { url: string }[] }) {
    const list: IRouterMetaExt[] = [];

    this.app.controllers.forEach(c => {
      c.mapper.forEach(m => {
        list.push({ ...m, controllerName: c.name });
      });
    });

    return generateRouterMetaInfo(list, opt);
  }
}
