import { HttpClientResponse } from 'urllib';
import { Config, pick } from '../src';
import { TestApp } from './DemoApp';

function inspectResp(resp: HttpClientResponse<any>) {
  return pick(resp, ['data', 'status']);
}

describe('App', () => {
  const config = new Config();
  const app = new TestApp(config);

  beforeAll(() => app.start());
  afterAll(() => app.stop());

  it('curl', async () => {
    const r1 = await app.curl<any>('http://localhost:10001/echo?text=hi', { dataType: 'json' });
    expect(inspectResp(r1)).toMatchSnapshot();
  });

  it('post body', async () => {
    const r2 = await app.curl<any>('http://localhost:10001/echo', {
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
    const r3 = await app.curl<any>('http://localhost:10001/echo?text=100', { dataType: 'json' });
    expect(inspectResp(r3)).toMatchSnapshot();
  });
});
