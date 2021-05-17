import { ICMSProps } from './type';

export const defaultLocale: { [k: string]: string } = {
  id: '编号',
  title: '标题',
  created_at: '创建时间',
  updated_at: '修改时间',
  name: '标识',
  summary: '摘要',
  content: '内容',
  meta: '附加信息',
  desc: '描述',
  app: '应用',
  stream: '流',
  cover: '封面',
  author: '作者',
  tag: '标签',
};

export const __ = (msg: string) => {
  return defaultLocale[msg] || msg;
};

export const defaultLabelRender: Required<Required<ICMSProps>['customRender']>['label'] = ({
  rootSchema,
  follow,
  schema,
}) => {
  if (schema.title) return schema.title;
  return follow.split('.').map(__).join('.');
};
