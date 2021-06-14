import {
  isSchemaArray,
  isSchemaInteger,
  isSchemaObject,
  isSchemaOneOf,
  isSchemaString,
  Schema,
  SchemaUi,
} from 'ah-api-type';
import _ from 'lodash';
import { IPagination } from './type';

const getByDataDotPath = (schema: Schema, dotPath: string) => {
  const sdp = _.flatten(
    dotPath.split('.').map(ps => {
      if (typeof ps === 'string') return ['properties', ps];
      if (typeof ps === 'number') return ['items'];
      throw new Error('bad dot value: ' + ps);
    })
  );

  const nextSchema = _.get(schema, sdp) as Schema | undefined;
  return nextSchema;
};

function getUiDef(schema: Schema) {
  return schema.__ui;
}

function getTitleGenerator(schema: Schema): ((d: any) => string) | undefined {
  for (const dp of ['title', 'name']) {
    const subS = getByDataDotPath(schema, dp);
    if (subS && isSchemaString(subS)) return d => _.get(d, dp);
  }
}

function getPaginationGenerator(
  schema: Schema,
  prefixDotPath = ''
): (((d: any) => IPagination<any>) & { itemSchema: Schema }) | undefined {
  // oneOf, skip
  if (isSchemaOneOf(schema)) return undefined;

  if (isSchemaArray(schema) && schema.items) {
    return Object.assign(
      (data: any[]) => {
        const nd = prefixDotPath ? _.get(data, prefixDotPath) : data;
        return {
          total: nd.length,
          pageNum: 1,
          pageSize: nd.length,
          list: nd,
        };
      },
      { itemSchema: schema.items }
    );
  }

  if (isSchemaObject(schema) && schema.properties) {
    let getList: ((d: any) => any[]) | undefined;
    let getPageSize: ((d: any) => number) | undefined;
    let getPageNum: ((d: any) => number) | undefined;
    let getTotal: ((d: any) => number) | undefined;
    let itemSchema: Schema | undefined;

    Object.entries(schema.properties).forEach(([pn, pv]) => {
      if (isSchemaArray(pv)) {
        getList = d => d[pn];
        itemSchema = pv.items;
        //
      } else if (isSchemaInteger(pv)) {
        if (pn === 'pageSize' || pn === 'size') getPageSize = d => d[pn];
        else if (pn === 'pageNum' || pn === 'current') getPageNum = d => d[pn];
        else if (pn === 'total' || pn === 'count') getTotal = d => d[pn];
      }
    });

    if (getTotal && getPageSize && getPageNum && itemSchema) {
      return Object.assign(
        (data: any) => {
          const nd = prefixDotPath ? _.get(data, prefixDotPath) : data;
          return {
            total: getTotal!(nd),
            list: getList!(nd),
            pageSize: getPageSize!(nd),
            pageNum: getPageNum!(nd),
          };
        },
        { itemSchema }
      );
    }

    // 这一层没有找到，递归往下找
    let ret: ReturnType<typeof getPaginationGenerator>;

    Object.entries(schema.properties).some(([sn, subSchema]) => {
      ret = getPaginationGenerator(subSchema, sn);
      return !!ret;
    });

    return ret;
  }
}

function getDetailGenerator(
  schema: Schema
): (((d: any) => any) & { itemSchema: Schema }) | undefined {
  // FIXME
  const itemSchema = getByDataDotPath(schema, 'data');
  if (!itemSchema) return;

  return Object.assign((d: any) => _.get(d, 'data'), { itemSchema });
}

export const SchemaHelper = {
  getByDataDotPath,
  getUiDef,
  getTitleGenerator,
  getDetailGenerator,
  getPaginationGenerator,
};
