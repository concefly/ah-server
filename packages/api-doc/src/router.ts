import { BaseController, IRouterMeta } from 'ah-server';
import * as _ from 'lodash';
import { data2Schema } from 'ah-api-generator';
import { Schema } from 'ah-api-type';

export function setInDeep(
  data: any,
  opt: {
    tester: (value: any, name: string) => boolean;
    converter: (value: any, name: string) => any;
  }
) {
  const _set = (current: any): any => {
    if (Array.isArray(current)) {
      return current.map(_set);
    }

    if (typeof current === 'object') {
      if (current === null) return current;

      const keys = Object.keys(current);
      const newData: any = {};

      keys.forEach(key => {
        const v = current[key] as any;
        if (typeof v === 'undefined') return;

        if (opt.tester(v, key)) {
          Object.assign(newData, opt.converter(v, key));
        } else {
          // 递归向下处理
          newData[key] = _set(v);
        }
      });

      return newData;
    }

    return current;
  };

  return _set(data);
}

export type IRouterMetaExt = IRouterMeta & { controller: BaseController; handlerName: string };

export function generateRouterMetaInfo(
  list: IRouterMetaExt[],
  opt: {
    version: string;
    services: { url: string }[];
    components?: { [name: string]: Schema };
  }
) {
  const apiDoc: any = {
    openapi: '3.0.1',
    info: { version: opt.version },
    servers: opt.services,
    components: opt.components,
  };

  // 生成 open api 文档
  list.forEach(m => {
    const schema = m.query?.schema || {};

    // 不支持 const 属性
    const convertedSchema = setInDeep(schema, {
      tester: (_v, _n) => _n === 'const',
      converter: (_v, n) => ({ [n]: undefined }),
    });

    const methods = Array.isArray(m.method) ? m.method : [m.method];

    methods.forEach(method => {
      // 遍历路由 path
      _.set(apiDoc, ['paths', m.path, method.toLowerCase()], {
        operationId: [m.controller.name.replace(/controller/i, ''), m.handlerName].join('.'),
        tags: m.tags,
        summary: m.description || `${m.method} ${m.path}`,

        // GET 或 DELETE 入参
        ...((m.method === 'GET' || m.method === 'DELETE') &&
          convertedSchema.type === 'object' && {
            parameters: _.map(convertedSchema.properties || {}, (s, n) => ({
              name: n,
              in: 'query',
              description: s.description,
              schema: s,
            })),
          }),

        // POST 或 PUT 入参
        ...((m.method === 'POST' || m.method === 'PUT') && {
          requestBody: {
            content: {
              'application/json': {
                schema: convertedSchema,
              },
            },
          },
        }),

        // 公共
        responses: {
          200: {
            description: 'ok',
            content: {
              'application/json': {
                schema: m.response?.schema
                  ? {
                      type: 'object',
                      properties: { data: m.response.schema },
                      required: ['data'],
                    }
                  : data2Schema({ data: (m.response?.examples || [])[0]?.data }),
                examples: m.response?.examples?.reduce(
                  (re, cur) => ({
                    ...re,
                    [cur.name]: { data: cur.data },
                  }),
                  {} as any
                ),
              },
            },
          },
        },
      });
    });
  });

  return { apiDoc };
}
