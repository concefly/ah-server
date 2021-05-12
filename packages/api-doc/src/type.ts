import { ApiDocService } from './service';
import { Schema } from 'jsonschema';

declare module 'ah-server' {
  interface IService {
    apiDoc?: ApiDocService;
  }

  interface IRouterMeta {
    description?: string;
    tags?: string[];
    response?: {
      examples?: { name: string; data: any }[];
      schema?: Schema;
    };
  }
}
