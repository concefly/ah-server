import { Schema, SchemaUi } from 'ah-api-type';
import _ from 'lodash';
import { IPagination } from './type';

export class RichSchema {
  static create(input: any): RichSchema {
    if (input instanceof RichSchema) return input;
    return new RichSchema(input);
  }

  constructor(private schema: Readonly<Schema>) {}

  getByDataDotPath(dotPath: string) {
    const sdp = _.flatten(
      dotPath.split('.').map(ps => {
        if (typeof ps === 'string') return ['properties', ps];
        if (typeof ps === 'number') return ['items'];
        throw new Error('bad dot value: ' + ps);
      })
    );

    const nextSchema = _.get(this.schema, sdp);

    return nextSchema ? RichSchema.create(nextSchema) : undefined;
  }

  getUiDef() {
    try {
      const legacyFormat = (this.schema as any)?.format
        ? (JSON.parse((this.schema as any).format).ui as SchemaUi)
        : undefined;

      return { ...this.schema.__ui, ...legacyFormat };
    } catch (_err) {
      return undefined;
    }
  }

  getPaginationGenerator(
    prefixDotPath = ''
  ): (((d: any) => IPagination<any>) & { itemSchema: RichSchema }) | undefined {
    if (this.schema.type === 'array') {
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
        { itemSchema: RichSchema.create(this.schema.items as any) }
      );
    }

    if (this.schema.type === 'object' && this.schema.properties) {
      let getList: ((d: any) => any[]) | undefined;
      let getPageSize: ((d: any) => number) | undefined;
      let getPageNum: ((d: any) => number) | undefined;
      let getTotal: ((d: any) => number) | undefined;
      let itemSchema: RichSchema | undefined;

      Object.entries(this.schema.properties).forEach(([pn, pv]) => {
        if (pv.type === 'array') {
          getList = d => d[pn];
          itemSchema = RichSchema.create(pv.items as any);
          //
        } else if (pv.type === 'integer') {
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
      let ret: ReturnType<RichSchema['getPaginationGenerator']>;

      Object.entries(this.schema.properties).some(([sn, subSchema]) => {
        ret = RichSchema.create(subSchema).getPaginationGenerator(sn);
        return !!ret;
      });

      return ret;
    }
  }

  getDetailGenerator(): (((d: any) => any) & { itemSchema: RichSchema }) | undefined {
    // FIXME
    const itemSchema = this.getByDataDotPath('data');
    if (!itemSchema) return;

    return Object.assign((d: any) => _.get(d, 'data'), { itemSchema });
  }

  getTitleGenerator(): ((d: any) => string) | undefined {
    for (const dp of ['title', 'name']) {
      const subS = this.getByDataDotPath(dp);
      if (subS && subS.type === 'string') return d => _.get(d, dp);
    }
  }

  get properties() {
    return this.schema.type === 'object' && this.schema.properties
      ? _.mapValues(this.schema.properties, p => RichSchema.create(p))
      : undefined;
  }

  get items() {
    return this.schema.type === 'array' && this.schema.items
      ? RichSchema.create(this.schema.items)
      : undefined;
  }

  get title() {
    return this.schema.title;
  }

  get required() {
    return this.schema.type === 'object' ? this.schema.required : undefined;
  }

  get type() {
    return this.schema.type;
  }
}
