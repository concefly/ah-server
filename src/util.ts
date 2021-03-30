import { Schema, validate as jsonschemaValidate } from 'jsonschema';
import { Context } from 'koa';
import { createBizError } from './error';

/** jsonschema 校验 */
export function validate<T>(this: Context, data: any, schema: Schema): T {
  const result = jsonschemaValidate(data, schema, {
    allowUnknownAttributes: false,
    rewrite: (_ins: any, _sch: Schema) => {
      if (typeof _ins !== 'undefined') {
        // _ins 有值，要检查

        if (_sch.type === 'object') {
          // 只允许 object properties 声明过的属性(安全原因)
          return _sch.properties ? pick(_ins, Object.keys(_sch.properties)) : _ins;
        }
      }

      return _ins;
    },
  });

  // 要取 result.instance，因为内部有 convertor
  if (result.errors.length === 0) return result.instance;

  const errMsg = result.errors.map(e => e.message).join(';');
  throw createBizError(errMsg);
}

export function pick<T extends object, U extends keyof T>(data: T, keys: U[]) {
  const newData: Pick<T, U> = {} as any;

  keys.forEach(k => {
    newData[k] = data[k];
  });

  return newData;
}

export function mapValues(data: any, mapper: (v: any, n: string) => any) {
  const newData: any = {};

  Object.entries(data).forEach(([n, v]) => {
    newData[n] = mapper(v, n);
  });

  return newData;
}

export function tryParseIntProperty(data: any) {
  return mapValues(data, d => {
    const n = +d;
    return isNaN(n) ? d : n;
  });
}
