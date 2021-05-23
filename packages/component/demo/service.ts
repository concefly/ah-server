import { IPagination } from '../src';
import { Chance } from 'chance';
import { Schema } from 'jsonschema';

const chance = new Chance();
export const delay = async (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const getRandomData = (id: any) => {
  return {
    data: {
      id,
      title: chance.city(),
    },
  };
};

export const getRandomPage = (q: {
  pageSize?: number;
  pageNum?: number;
}): { data: IPagination<{ id: number; title: string }> } => {
  const { pageSize = 5, pageNum = 1 } = q;

  return {
    data: {
      total: 100,
      pageNum,
      pageSize,
      list: Array(pageSize)
        .fill('x')
        .map((_, i) => getRandomData(i).data),
    },
  };
};

export function createMethod<T, M>(method: T, $meta: M) {
  return Object.assign(method, { $meta });
}

const dataItemSchema: Schema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
  },
  required: ['id', 'title'],
};

const pageSchema: Schema = {
  type: 'object',
  properties: {
    total: { type: 'integer' },
    pageSize: { type: 'integer' },
    pageNum: { type: 'integer' },
    list: {
      type: 'array',
      items: dataItemSchema,
    },
  },
  required: ['total', 'pageNum', 'pageSize', 'list'],
};

export const service = {
  device: {
    list: createMethod(
      async (q: any) => {
        await delay(200);
        return getRandomPage(q);
      },
      {
        tags: ['cms:device:list'],
        query: { schema: { type: 'object', properties: { title: { type: 'string' } } } },
        response: {
          schema: {
            type: 'object',
            properties: {
              data: pageSchema,
            },
          },
        },
      }
    ),
    //
    create: createMethod(
      async (q: any) => {
        console.log('@@@', 'create ->', q);
        await delay(200);
        return getRandomData(q.id);
      },
      {
        tags: ['cms:device:create'],
        query: {
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    title: { type: 'string' },
                    members: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                        },
                        required: ['id'],
                      },
                    },
                  },
                  required: ['name'],
                },
              },
            },
          },
        },
        response: {
          schema: {},
        },
      }
    ),
    //
    detail: createMethod(
      async (q: any) => {
        await delay(200);
        return getRandomData(q.id);
      },
      {
        tags: ['cms:device:read'],
        query: { schema: { type: 'object', properties: { id: { type: 'number' } } } },
        response: {
          schema: {
            type: 'object',
            properties: {
              data: dataItemSchema,
            },
          },
        },
      }
    ),
    //
    update: createMethod(
      async (q: any) => {
        await delay(200);
        return getRandomData(q.id);
      },
      {
        tags: ['cms:device:update'],
        query: { schema: { type: 'object', properties: { title: { type: 'string' } } } },
        response: {
          schema: {},
        },
      }
    ),
  },
};
