declare module '.' {
  interface IConfig extends BaseConfig {}
}

export class BaseConfig {
  readonly LOCAL_PORT: number = +(process.env.LOCAL_PORT || 10001);
  readonly HTTPS_KEY = process.env.HTTPS_KEY;
  readonly HTTPS_CERT = process.env.HTTPS_CERT;
  readonly AUTH_SALT = process.env.HTTPS_CERT || 'x';

  sequelize() {
    return Object.entries(this)
      .filter(([, v]) => typeof v !== 'undefined')
      .map(([n, v]) => `${n}=${v}`)
      .join(' ');
  }
}
