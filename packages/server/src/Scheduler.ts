import { BaseService } from './Service';

/** 基础调度服务 */
export abstract class BaseScheduler extends BaseService {
  immediately?: boolean;

  abstract timer: { type: 'cron'; cron: string } | { type: 'interval'; interval: number };
  abstract invoke(): Promise<void>;
}
