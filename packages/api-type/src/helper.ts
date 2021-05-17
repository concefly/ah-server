import { Schema, SchemaArray, SchemaObject } from './type';

export function createList<T extends Schema>(item: T): SchemaArray {
  return {
    type: 'array',
    items: item,
  };
}

export function createPagination<T extends Schema>(item: T): SchemaObject {
  return {
    type: 'object',
    properties: {
      total: { type: 'integer' },
      pageSize: { type: 'integer' },
      pageNum: { type: 'integer' },
      list: createList(item),
    },
    required: ['total', 'pageSize', 'pageNum', 'list'],
  };
}
