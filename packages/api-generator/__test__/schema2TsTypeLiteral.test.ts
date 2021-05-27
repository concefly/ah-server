import { schema2TsTypeLiteral } from '../src';

describe('schema2TsTypeLiteral', () => {
  it('oneOf', () => {
    const tsType = schema2TsTypeLiteral({
      oneOf: [
        { type: 'object', properties: { a: { type: 'string' } } },
        { type: 'object', properties: { b: { type: 'string' } } },
      ],
    });

    expect(tsType).toMatchSnapshot();
  });

  it('oneOf deep', () => {
    const tsType = schema2TsTypeLiteral({
      oneOf: [
        { type: 'object', properties: { a: { type: 'string' } } },
        {
          type: 'object',
          properties: {
            b: { type: 'string' },
            c: {
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    cs1: { type: 'string' },
                  },
                  required: ['cs1'],
                },
                {
                  type: 'object',
                  properties: {
                    cs2: { type: 'string' },
                  },
                  required: ['cs2'],
                },
              ],
            },
          },
        },
      ],
    });

    expect(tsType).toMatchSnapshot();
  });

  it('string enum', () => {
    const tsType = schema2TsTypeLiteral({
      type: 'string',
      enum: ['a', 'b', 'c'],
    });

    expect(tsType).toMatchSnapshot();
  });

  it('integer enum', () => {
    const tsType = schema2TsTypeLiteral({
      type: 'integer',
      enum: [1, 2, 3],
    });

    expect(tsType).toMatchSnapshot();
  });
});
