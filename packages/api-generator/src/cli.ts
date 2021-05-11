#!/usr/bin/env node

import yargs from 'yargs';
import { generateAPIService } from './index';

const args = yargs
  .option('input', { alias: 'i', describe: 'apiDoc', type: 'string', required: true })
  .option('headers', { describe: 'fetch headers', type: 'array' })
  .option('operation-id-splitter', { describe: 'operationId 分隔符，默认', type: 'string' })
  .option('template', { alias: 't', describe: '模板', type: 'string' })
  .option('banner', { alias: 'b', describe: 'banner', type: 'string' })
  .option('dump', { alias: 'd', describe: '导出', type: 'string' }).argv;

generateAPIService({
  input: args.input.match(/^(http|https)\:\/\//)
    ? {
        type: 'remote',
        url: args.input,
        headers: args.headers
          ? args.headers.reduce((re, cu) => {
              const [k, v] = (cu + '').split(':');
              return { ...re, [k]: v };
            }, {} as any)
          : undefined,
      }
    : { type: 'local', filename: args.input },
  operationIdSplitter: args['operation-id-splitter'],
  template: args.template,
  banner: args.banner,
  dump: args.dump,
})
  .then(content => {
    if (!args.dump) console.log(content);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
