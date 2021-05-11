import { OpenAPIV3 as API } from 'openapi-types';
import _ from 'lodash';
import { Schema } from 'jsonschema';

import { inspect } from 'util';

export const log = (...args: any[]) => {
  console.log(...args.map(arg => inspect(arg, { showHidden: false, depth: null })));
};

export function parseRequestSchema(
  data:
    | API.PathItemObject['get']
    | API.PathItemObject['put']
    | API.PathItemObject['post']
    | API.PathItemObject['delete']
): Schema | undefined {
  if (!data) return;

  const schema: Schema = {
    type: 'object',
    properties: {},
  };

  if (data.parameters) {
    (data.parameters as API.ParameterObject[]).forEach(p => {
      Object.assign(schema.properties!, {
        [p.name]: p.schema,
      });
    });
  }

  if (data.requestBody) {
    const requestBodyContentJson = (data.requestBody as API.RequestBodyObject).content[
      'application/json'
    ];

    if (typeof (requestBodyContentJson?.schema as any)?.type !== 'undefined') {
      const jSchema = requestBodyContentJson?.schema as Schema;
      _.merge(schema, jSchema);
    }
  }

  // 没有收集到，返回空
  if (_.isEmpty(schema.properties)) return;

  return schema;
}

export function parseResponseSchema(
  data:
    | API.PathItemObject['get']
    | API.PathItemObject['put']
    | API.PathItemObject['post']
    | API.PathItemObject['delete']
): Schema | undefined {
  const response = data?.responses?.['200'] as API.ResponseObject;
  const jsonResponse = response.content?.['application/json'];

  if (jsonResponse) {
    // 尝试取 schema
    if (jsonResponse.schema) return jsonResponse.schema as Schema;

    const example =
      jsonResponse.example || (jsonResponse.examples && Object.values(jsonResponse.examples).pop());

    // 尝试转换 example
    if (example) return data2Schema(example);
  }
}

export type IRequestMeta = {
  query?: {
    schema: Schema;
    tsTypeLiteral: string;
  };
  response?: {
    schema: Schema;
    tsTypeLiteral: string;
  };
  pathName: string;
  method: string;
  description?: string;
};

export interface IServiceMap {
  [serviceName: string]: {
    [requestName: string]: IRequestMeta;
  };
}

export function renderService(apiDoc: API.Document, opt: { operationIdSplitter?: string } = {}) {
  const serviceMap: IServiceMap = {};
  const { operationIdSplitter = '.' } = opt;

  Object.entries(apiDoc.paths).forEach(([pathName, pi]) => {
    if (!pi) return;

    Object.entries({
      GET: pi.get,
      PUT: pi.put,
      POST: pi.post,
      DELETE: pi.delete,
    }).forEach(([method, commonPiData]) => {
      if (!commonPiData) return;

      let [serviceName, requestName] = (
        commonPiData.operationId || `default${operationIdSplitter}${_.camelCase(pathName)}`
      ).split(operationIdSplitter);

      serviceName = _.capitalize(serviceName);

      const requestSchema = parseRequestSchema(commonPiData);
      const respSchema = parseResponseSchema(commonPiData);

      const requestMeta: IRequestMeta = {
        query: requestSchema
          ? { schema: requestSchema, tsTypeLiteral: schema2TsTypeLiteral(requestSchema) }
          : undefined,
        response: respSchema
          ? { schema: respSchema, tsTypeLiteral: schema2TsTypeLiteral(respSchema) }
          : undefined,
        method,
        pathName,
        description: commonPiData.description,
      };

      //
      _.set(serviceMap, [serviceName, requestName], requestMeta);
    });
  });

  return serviceMap;
}

export function schema2TsTypeLiteral(s?: Schema): string {
  if (!s) return 'never';

  if (s.type === 'string') return 'string';
  if (s.type === 'integer') return 'number';

  if (s.type === 'array') {
    return `Array<${schema2TsTypeLiteral((s.items as any) || '{}')}>`;
  }

  if (s.type === 'object') {
    {
      if (s.properties) {
        return [
          '{',
          Object.entries(s.properties).map(([pn, pv]) => {
            const isRequired =
              typeof s.required === 'boolean'
                ? s.required
                : Array.isArray(s.required)
                ? s.required.includes(pn)
                : false;

            const tsType = schema2TsTypeLiteral(pv);

            return `${pn}${isRequired ? '' : '?'}: ${tsType}`;
          }),
          '}',
        ].join(' ');
      }

      return 'object';
    }
  }

  return 'any';
}

/** 从数据结构猜测 schema */
export function data2Schema(data: any): Schema {
  if (_.isString(data)) return { type: 'string' };
  if (_.isInteger(data)) return { type: 'integer' };
  if (_.isNumber(data)) return { type: 'number' };

  if (_.isBoolean(data)) return { type: 'boolean' };

  if (_.isArray(data)) {
    return {
      type: 'array',
      items: data2Schema(data[0]),
    };
  }

  if (_.isPlainObject(data)) {
    return {
      type: 'object',
      properties: _.mapValues(data, data2Schema),
      required: Object.keys(data),
    };
  }

  return {};
}
