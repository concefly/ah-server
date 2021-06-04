import { Schema, validate as jsonschemaValidate } from 'jsonschema';
import { createBizError } from './error';

/** jsonschema 校验 */
export function validate<T>(data: any, schema: Schema): T {
  const result = jsonschemaValidate(data, schema, {
    allowUnknownAttributes: true,
    rewrite: (_ins: any, _sch: Schema) => {
      if (typeof _ins !== 'undefined') {
        // _ins 有值，要检查

        if (_sch.type === 'object') {
          // 只允许 object properties 声明过的属性(安全原因)
          return _sch.properties ? omitUndefined(pick(_ins, Object.keys(_sch.properties))) : _ins;
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

export function getOwnPropertyEntries(target: any) {
  // 只收集 target 自己的属性。继承属性不处理
  // FIXME: 不用 for ... in 语法，因为 es6 class 下遍历不了原型链上的方法
  // @see https://stackoverflow.com/questions/30881632/es6-iterate-over-class-methods
  const keys = [
    // 自身属性
    ...Object.getOwnPropertyNames(target),
    // 原型链上所有属性(method 默认不可枚举，所以要用 getOwnPropertyNames)
    ...Object.getOwnPropertyNames(Object.getPrototypeOf(target)),
  ];

  const list = keys.map(k => [k, target[k]]);

  return list;
}

export const omitUndefined = <T extends Record<string, any>>(data: T): Partial<T> => {
  const re: any = {};

  for (const key of Object.keys(data)) {
    if (typeof data[key] !== 'undefined') re[key] = data[key];
  }

  return re;
};
