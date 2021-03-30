import { Service } from './Service';

/** 基础调度服务 */
export class Scheduler extends Service {
  cron?: string;
  interval?: number;

  async invoke(): Promise<void> {}
}
