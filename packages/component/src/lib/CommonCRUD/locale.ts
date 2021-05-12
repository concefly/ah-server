export const defaultLocale: { [k: string]: string } = {
  id: '编号',
  title: '标题',
};

export const __ = (msg: string) => {
  return defaultLocale[msg] || msg;
};
