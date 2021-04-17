import { CronJob } from 'cron';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as koaBody from 'koa-body';
import * as urllib from 'urllib';
import { Logger } from 'ah-logger';
import { BaseScheduler } from './Scheduler';
import { IConfig, IContext, IService } from '.';
import { ErrorTypeEnum } from './error';
import { pick, tryParseIntProperty, validate } from './util';
import { BaseController, IMiddleware } from './Controller';
import * as http from 'http';
import * as https from 'https';
import { CloseEvt, ReadyEvt } from './Event';
import * as fs from 'fs';

declare module '.' {
  interface IApplication extends BaseApp {}

  // eslint-disable-next-line
  interface IContext {
    validate: typeof validate;
    app: IApplication;
  }
}

export abstract class BaseApp extends Koa {
  /** @deprecated use `middlewares` instead */
  middleware: never;

  constructor(readonly config: IConfig) {
    super();
  }

  abstract service: IService = {};
  abstract controllers: BaseController[] = [];
  middlewares: IMiddleware[] = [];
  abstract schedulers: BaseScheduler[] = [];

  logger = new Logger('APP');

  private httpServer?: http.Server;

  async curl<T>(url: string, opt?: urllib.RequestOptions) {
    return urllib.request<T>(url, opt);
  }

  private async initCommon() {
    // 扩展 ctx
    Object.assign(this.context, { validate, app: this });

    // 全局错误
    this.on('error', err => {
      let msg = err.message || err;
      if (err.stack) msg += '\n' + err.stack;

      this.logger.error(msg);
    });
  }

  private async initController() {
    this.use(koaBody());

    // 构造 router
    const router = new Router<any, IContext>();
    this.controllers.forEach(ctrlIns => {
      ctrlIns.mapper.forEach(m => {
        this.logger.info(
          `register controller: ${m.method} ${m.path} -> ${ctrlIns.name}.${m.handler.name}`
        );

        const name = [ctrlIns.name, m.handler.name].join('.');
        const methods = Array.isArray(m.method) ? m.method : [m.method];
        const middlewares = [
          ...this.middlewares,
          ...(m.middlewares || []),
          (ctx: IContext, next: any) => {
            const handler = async () => {
              const q = m.query
                ? ctx.validate<any>(
                    {
                      ...tryParseIntProperty(ctx.params),
                      ...tryParseIntProperty(ctx.request.query),
                      ...ctx.request.body,
                    },
                    m.query.schema
                  )
                : undefined;

              const data = await m.handler.call(ctrlIns, ctx, q);

              if (data) {
                ctx.set('content-type', 'application/json');
                ctx.body = { ...(ctx.body as any), data };
              }
            };

            handler()
              .catch(err => {
                // 自定义异常
                if (Object.values(ErrorTypeEnum).includes(err.type)) {
                  ctx.status = err.status;
                  ctx.body = pick(err, ['message', 'type', 'code', 'status']);
                  return;
                }

                // 其他异常外抛
                throw err;
              })
              .finally(() => next());
          },
        ];

        if (methods.includes('GET')) router.get(name, m.path, ...middlewares);
        if (methods.includes('POST')) router.post(name, m.path, ...middlewares);
        if (methods.includes('PUT')) router.put(name, m.path, ...middlewares);
        if (methods.includes('DELETE')) router.delete(name, m.path, ...middlewares);
      });
    });

    this.use(router.routes());
    this.use(router.allowedMethods());
  }

  /** 启动定时调度 */
  private async initScheduler() {
    const list = this.schedulers;
    if (list.length === 0) return;

    const schedulerLogger = this.logger.extend('Scheduler');
    const startList = list.map(s => {
      if (s.timer.type === 'cron') {
        const { cron } = s.timer;
        return () => {
          new CronJob(
            cron,
            () => {
              s.invoke().catch(e => {
                schedulerLogger.error(`${s.name} error: ${e.message || e}`);
              });
            },
            undefined,
            s.immediately, // start
            undefined,
            undefined,
            true
          ).start();
        };
      }

      if (s.timer.type === 'interval') {
        const { interval } = s.timer;
        return () => {
          const invoke = () => {
            s.invoke()
              .then(() => setTimeout(invoke, interval))
              .catch(e => {
                schedulerLogger.error(`${s.name} error: ${e.message || e}`);
                setTimeout(invoke, interval);
              });
          };

          if (s.immediately) invoke();
          else setTimeout(invoke, interval);
        };
      }
    });

    startList.forEach(s => s?.());

    this.logger.info(`start scheduler: ${list.map(s => s.name)}`);
  }

  async start() {
    this.logger.info(this.config.sequelize());

    await this.initCommon();
    await this.initController();

    const port = this.config.LOCAL_PORT;
    const callback = this.callback();

    const server = (this.httpServer =
      this.config.HTTPS_KEY && this.config.HTTPS_CERT
        ? https.createServer(
            {
              key: fs.readFileSync(this.config.HTTPS_KEY, 'utf-8'),
              cert: fs.readFileSync(this.config.HTTPS_CERT, 'utf-8'),
            },
            callback
          )
        : http.createServer(callback));

    server.listen(port);
    this.logger.info(`app start at localhost:${port}`);

    // scheduler 放到启动后
    await this.initScheduler();

    this.emit(ReadyEvt, { server } as ReadyEvt);
  }

  async stop(): Promise<void> {
    if (!this.httpServer) return;
    const server = this.httpServer;

    return new Promise<void>((resolve, reject) => {
      // 优雅退出
      // @see https://zhuanlan.zhihu.com/p/275312155?utm_source=wechat_session&utm_medium=social&utm_oi=39191756931072
      server.close(err => {
        if (err) return reject(err);
        return resolve();
      });
    }).finally(() => this.emit(CloseEvt));
  }
}
