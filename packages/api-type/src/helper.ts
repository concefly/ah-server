import { Schema } from './type';

export function createList(item: Schema): Schema {
  return {
    type: 'array',
    items: item,
  };
}

export function createPagination(item: Schema): Schema {
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
