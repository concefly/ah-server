import { Schema } from './schema';

export type IApiServiceRequest<Q, T> = (q: Q) => Promise<T>;

export type IApiServiceMeta = {
  tags?: string[];
  pathName: string;
  method: string;
  description: string;
  query: { schema: Schema };
  response: { schema: Schema };
};

export type IApiService<Q, T> = IApiServiceRequest<Q, T> & { $meta?: IApiServiceMeta };
