import { Schema } from 'ah-api-type';

export function schema2TsTypeLiteral(s?: Schema): string {
  if (!s) return 'never';

  if ('oneOf' in s) return s.oneOf.map(schema2TsTypeLiteral).join(' | ');

  if (s.type === 'string') {
    if (s.enum)
      return s.enum
        .map(t =>
          // 转换成 string 字面量
          JSON.stringify(t)
        )
        .join(' | ');
    return 'string';
  }

  if (s.type === 'integer' || s.type === 'number') {
    if (s.enum) return s.enum.join(' | ');
    return 'number';
  }

  if (s.type === 'array') {
    return `Array<${schema2TsTypeLiteral((s.items as any) || '{}')}>`;
  }

  if (s.type === 'object') {
    if (s.properties) {
      return [
        '{',
        Object.entries(s.properties).map(([pn, pv]) => {
          const isRequired =
            typeof s.required === 'boolean'
              ? s.required
              : Array.isArray(s.required)
              ? s.required.includes(pn)
              : false;

          const tsType = schema2TsTypeLiteral(pv);

          return `${pn}${isRequired ? '' : '?'}: ${tsType}`;
        }),
        '}',
      ].join(' ');
    }

    return 'object';
  }

  return 'any';
}
