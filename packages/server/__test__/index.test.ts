import { HttpClientResponse } from 'urllib';
import { BaseConfig, pick } from '../src';
import { TestApp } from './DemoApp';

const port = 20000;

function inspectResp(resp: HttpClientResponse<any>) {
  return pick(resp, ['data', 'status']);
}

describe('App', () => {
  const config = new BaseConfig();
  const app = new TestApp(config);

  beforeAll(() => app.start());
  afterAll(() => app.stop());

  it('curl', async () => {
    const r1 = await app.curl<any>(`http://localhost:${port}/echo?text=hi`, { dataType: 'json' });
    expect(inspectResp(r1)).toMatchSnapshot();
  });

  it('post body', async () => {
    const r2 = await app.curl<any>(`http://localhost:${port}/echo`, {
      method: 'POST',
      contentType: 'json',
      dataType: 'json',
      data: {
        text: 'hi',
      },
    });
    expect(inspectResp(r2)).toMatchSnapshot();
  });

  it('validate 400', async () => {
    const r3 = await app.curl<any>(`http://localhost:${port}/echo?text=100`, { dataType: 'json' });
    expect(inspectResp(r3)).toMatchSnapshot();
  });

  it('middleware', async () => {
    const r = await app.curl<any>(`http://localhost:${port}/echo?text=hi`, { dataType: 'json' });
    expect(r.headers['x-a']).toEqual('a');
    expect(r.headers['x-b']).toEqual('b');
  });

  it('upload file', async () => {
    const r = await app.curl<any>(`http://localhost:${port}/file`, {
      dataType: 'json',
      data: { a: 'a' },
      files: [Buffer.from('x')],
    });
    expect(r.data.data.a).toBeTruthy();
    expect(r.data.data.file.path).toBeTruthy();
  });

  it('query tap', async () => {
    const r = await app.curl<any>(`http://localhost:${port}/queryTap`, {
      dataAsQueryString: true,
      data: { pageNum: 1, title: 'aaa' },
      dataType: 'json',
    });
    expect(r.data.data).toEqual({ pageNum: 1, title: 'aaa' });
  });
});
