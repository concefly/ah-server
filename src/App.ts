import { CronJob } from 'cron';
import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';
import urllib, { RequestOptions } from 'urllib';
import { Logger } from './Logger';
import { Scheduler } from './Scheduler';
import { Service } from './Service';
import { IConfig, IContext, IService } from '.';
import { ErrorTypeEnum } from './error';
import { pick, tryParseIntProperty, validate } from './util';
import { Controller } from './Controller';
import { Server } from 'http';

declare module '.' {
  interface IApplication extends App {}

  // eslint-disable-next-line
  interface IContext {
    validate: typeof validate;
    app: IApplication;
  }
}

export abstract class App extends Koa {
  constructor(readonly config: IConfig) {
    super();
  }

  // 注入 app 扩展
  public abstract service: IService = {};
  /** controller 列表 */
  public abstract controllerList: Controller[] = [];
  /** 定时任务列表 */
  public abstract schedulerList: Scheduler[] = [];

  public logger = new Logger();

  private server?: Server;

  public async curl<T>(url: string, opt?: RequestOptions) {
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

  private async initService() {
    const list: Service[] = Object.values(this.service);
    await Promise.all(list.map(s => s.init?.()));

    this.logger.info(`service: ${list.map(s => s.name)}`);
  }

  private async initController() {
    this.use(koaBody());

    // 构造 router
    const router = new Router<any, IContext>();
    this.controllerList.forEach(ctrlIns => {
      ctrlIns.mapper.forEach(m => {
        this.logger.info(
          `register controller: ${m.method} ${m.path} -> ${ctrlIns.name}.${m.handler.name}`
        );

        router.register(m.path, Array.isArray(m.method) ? m.method : [m.method], async ctx => {
          try {
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
              ctx.body = { ...ctx.body, data };
            }
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
        });
      });
    });

    this.use(router.routes());
    this.use(router.allowedMethods());

    await Promise.all(this.controllerList.map(c => c.init?.()));
  }

  /** 启动定时调度 */
  private async initScheduler() {
    const list = this.schedulerList;
    if (list.length === 0) return;

    const schedulerLogger = this.logger.extend('Scheduler');
    const startList = list.map(s => {
      if (s.cron) {
        return () => {
          new CronJob(
            s.cron!,
            () => {
              s.invoke().catch(e => {
                schedulerLogger.error(`${s.name} error: ${e.message || e}`);
              });
            },
            undefined,
            false,
            undefined,
            undefined,
            true
          ).start();
        };
      } else if (s.interval) {
        return () => {
          const invoke = () => {
            s.invoke()
              .then(() => setTimeout(invoke, s.interval))
              .catch(e => {
                schedulerLogger.error(`${s.name} error: ${e.message || e}`);
                setTimeout(invoke, s.interval);
              });
          };

          invoke();
        };
      }
    });

    startList.forEach(s => s?.());

    this.logger.info(`start scheduler: ${list.map(s => s.name)}`);
  }

  public async start() {
    this.logger.info(this.config.sequelize());

    await this.initCommon();
    await this.initService();
    await this.initController();
    await this.initScheduler();

    const port = this.config.LOCAL_PORT;
    this.server = this.listen(port);
    this.logger.info(`app start at localhost:${port}`);
  }

  public async stop(): Promise<void> {
    if (!this.server) return;
    const server = this.server;

    return new Promise((resolve, reject) => {
      // 优雅退出
      // @see https://zhuanlan.zhihu.com/p/275312155?utm_source=wechat_session&utm_medium=social&utm_oi=39191756931072
      server.close(err => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }
}
