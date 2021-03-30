declare module '.' {
  interface IConfig extends Config {}
}

export class Config {
  readonly LOCAL_PORT: number = +(process.env.LOCAL_PORT || 10001);

  sequelize() {
    return Object.entries(this)
      .map(([n, v]) => `${n}=${v}`)
      .join(' ');
  }
}
