// 运行时的 util

import { IApiServiceRequest, IApiServiceMeta, IApiService } from 'ah-api-type';

export function createMethod<Q, T>(
  method: IApiServiceRequest<Q, T>,
  $meta?: IApiServiceMeta
): IApiService<Q, T> {
  return Object.assign(method, { $meta });
}

export function replaceUrlParams(url: string, data?: any) {
  if (!data) return url;

  const match = url.match(/\:\w+/g);
  if (match) {
    const pnSet = new Set(match.map(p => p.replace(/^\:/, '')));
    pnSet.forEach(p => {
      url = url.replace(new RegExp(`\:${p}`, 'g'), data[p]);
    });
  }

  return url;
}
