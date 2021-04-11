import { BaseService } from './Service';

/** 基础调度服务 */
export class BaseScheduler extends BaseService {
  cron?: string;
  interval?: number;

  async invoke(): Promise<void> {}
}
