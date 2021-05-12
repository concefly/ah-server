import { ICRUDProps, IPagination } from '../src';
import { Chance } from 'chance';
import { Schema } from '_jsonschema@1.4.0@jsonschema';

const chance = new Chance();
export const delay = async (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const getRandomData = (id: any) => {
  return {
    id,
    title: chance.city(),
  };
};

export const getRandomPage = (q: {
  pageSize?: number;
  pageNum?: number;
}): IPagination<{ id: number; title: string }> => {
  const { pageSize = 5, pageNum = 1 } = q;

  return {
    total: 100,
    pageNum,
    pageSize,
    list: Array(pageSize)
      .fill('x')
      .map((_, i) => getRandomData(i)),
  };
};

export const createCRUDProps = <
  T extends ICRUDProps<
    {
      pageSize?: number;
      pageNum?: number;
    },
    { id: number; title: string }
  >
>(
  routerPrefix: string
): T => {
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
      pageNum: { type: 'integer' },
      pageSize: { type: 'integer' },
      list: {
        type: 'array',
        items: dataItemSchema,
      },
    },
    required: ['total', 'pageNum', 'pageSize', 'list'],
  };

  const listService: T['listService'] = {
    query: { schema: {} },
    response: { schema: pageSchema },
    invoke: async q => {
      await delay(200);
      return getRandomPage(q);
    },
  };

  const createService: T['createService'] = {
    query: { schema: { ...dataItemSchema, required: ['title'] } },
    invoke: async () => {
      await delay(200);
      return { id: chance.integer({ min: 1, max: 9999 }) };
    },
  };

  const readService: T['readService'] = {
    response: { schema: dataItemSchema },
    invoke: async id => {
      await delay(200);
      return getRandomData(id);
    },
  };

  const updateService: T['updateService'] = {
    query: { schema: { ...dataItemSchema } },
    invoke: async () => {
      await delay(200);
    },
  };

  const deleteService: T['deleteService'] = {
    invoke: async () => {
      await delay(200);
    },
  };

  return {
    routerPrefix,
    createService,
    listService,
    readService,
    updateService,
    deleteService,
  } as T;
};
