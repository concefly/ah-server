import dayjs from 'dayjs';

export class Logger {
  private name = 'APP';

  setName(name: string) {
    this.name = name;
    return this;
  }

  private ft(level: string, msg: string) {
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS');
    return `[${timestamp}|${this.name}|${level}] ${msg}`;
  }

  extend(subName: string): Logger {
    const newName = [this.name, subName].join('.');
    return new Logger().setName(newName);
  }

  info(msg: string) {
    console.info(this.ft('INFO', msg));
  }

  error(msg: string) {
    console.error(this.ft('ERROR', msg));
  }
}
