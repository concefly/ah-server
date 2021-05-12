import { Schema } from 'jsonschema';

export type IDType = any;

export interface IPagination<D> {
  total: number;
  pageSize: number;
  pageNum: number;
  list: D[];
}

export interface ICRUDProps<
  IndexQ extends { pageNum?: number; pageSize?: number },
  D extends { id: any }
> {
  routerPrefix: string;
  listService: {
    query: {
      schema: Schema;
    };
    response: {
      schema: Schema;
    };
    invoke(q: IndexQ): Promise<IPagination<D>>;
  };
  createService: {
    query: {
      schema: Schema;
    };
    invoke(q: Partial<D>): Promise<{ id: any }>;
  };
  updateService: {
    query: {
      schema: Schema;
    };
    invoke(q: Partial<D>): Promise<any>;
  };
  readService: {
    response: {
      schema: Schema;
    };
    invoke(id: any): Promise<D>;
  };
  deleteService: {
    invoke(id: any): Promise<any>;
  };
}
