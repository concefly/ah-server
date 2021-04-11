declare module '.' {
  interface IConfig extends BaseConfig {}
}

export class BaseConfig {
  readonly LOCAL_PORT: number = +(process.env.LOCAL_PORT || 10001);

  sequelize() {
    return Object.entries(this)
      .map(([n, v]) => `${n}=${v}`)
      .join(' ');
  }
}
