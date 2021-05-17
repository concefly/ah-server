import { CronJob } from 'cron';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as koaBody from 'koa-body';
import * as urllib from 'urllib';
import { Logger } from 'ah-logger';
import { BaseScheduler } from './Scheduler';
import { IConfig, IContext, IMiddleware, IService } from '.';
import { ErrorTypeEnum } from './error';
import { getOwnPropertyEntries, pick, tryParseIntProperty, validate } from './util';
import { BaseController } from './Controller';
import * as http from 'http';
import * as https from 'https';
import { CloseEvt, ReadyEvt } from './Event';
import * as fs from 'fs';
import { BaseExtension } from './Extension';
import { getRouterMeta } from './refactor';
import * as jwt from 'jsonwebtoken';

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
  /** @deprecated use `extend` instead */
  use: never;

  constructor(readonly config: IConfig) {
    super();
  }

  abstract service: IService = {};
  abstract controllers: BaseController[] = [];
  middlewares: IMiddleware[] = [];
  abstract schedulers: BaseScheduler[] = [];

  extensions: BaseExtension[] = [];

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

    this.middlewares.forEach(m => (this.use as any)(m));
  }

  private async initController() {
    (this.use as any)(koaBody({ multipart: true }));

    // 构造 router
    const router = new Router<any, IContext>();

    this.controllers.forEach(ctrlIns => {
      getOwnPropertyEntries(ctrlIns).forEach(([pName, handler]) => {
        if (typeof handler !== 'function') return;

        const rMeta = getRouterMeta(ctrlIns, pName);
        if (!rMeta) return;

        this.logger.info(
          `register controller: ${rMeta.method} ${rMeta.path} -> ${ctrlIns.name}.${handler.name}`
        );

        const name = [ctrlIns.name, handler.name].join('.');
        const methods = Array.isArray(rMeta.method) ? rMeta.method : [rMeta.method];

        const wrapperMid: IMiddleware = async (ctx, next) => {
          try {
            return await next();
          } catch (err) {
            // 自定义异常
            if (Object.values(ErrorTypeEnum).includes(err.type)) {
              ctx.status = err.status;
              ctx.body = pick(err, ['message', 'type', 'code', 'status']);
              return;
            }

            // 其他异常外抛
            throw err;
          }
        };

        const middlewares = [
          wrapperMid,
          ...(rMeta.middlewares || []),
          async (ctx: IContext) => {
            let q: any;

            if (rMeta.query) {
              q = {
                ...ctx.params,
                ...ctx.request.query,
                ...ctx.request.body,
                ...ctx.request.files,
              };

              if (rMeta.query.tap) {
                if (typeof rMeta.query.tap === 'function') q = rMeta.query.tap(q);
                else if (rMeta.query.tap === 'tryParseIntProperty') q = tryParseIntProperty(q);
              }

              q = ctx.validate<any>(q, rMeta.query.schema);
            }

            const data = await handler.call(ctrlIns, ctx, q);

            if (data) {
              ctx.set('content-type', 'application/json');
              ctx.body = { ...(ctx.body as any), data };
            }
          },
        ];

        if (methods.includes('GET')) router.get(name, rMeta.path, ...middlewares);
        if (methods.includes('POST')) router.post(name, rMeta.path, ...middlewares);
        if (methods.includes('PUT')) router.put(name, rMeta.path, ...middlewares);
        if (methods.includes('DELETE')) router.delete(name, rMeta.path, ...middlewares);
      });
    });

    (this.use as any)(router.routes());
    (this.use as any)(router.allowedMethods());
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

  private async initExtension() {
    this.extensions.forEach(ext => {
      // service
      Object.assign(this.service, ext.getService(this));

      // middleware
      ext.getMiddleware().forEach(mid => this.middlewares.push(mid));
    });
  }

  async start() {
    this.logger.info(this.config.sequelize());

    await this.initExtension();
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

  runInBackground(callback: () => Promise<any>) {
    callback().catch(err => {
      this.logger.error(err);
    });
  }

  readonly jwt = {
    sign: <T extends Record<string, any>>(payload: T, expiresIn = '15d') =>
      jwt.sign(payload, this.config.AUTH_SALT, { expiresIn }),
    //
    verify: <T extends any>(token: string, opt?: jwt.VerifyOptions) => {
      try {
        return jwt.verify(token, this.config.AUTH_SALT, opt) as T;
      } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) return null;
        if (err instanceof jwt.NotBeforeError) return null;
        if (err instanceof jwt.TokenExpiredError) return null;
        throw err;
      }
    },
  };
}
