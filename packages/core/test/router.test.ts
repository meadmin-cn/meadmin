import { createHttpRequest } from '@midwayjs/mock';
import { getApp } from './setup.js';
import assert from 'assert';


describe('/test/router.test.ts', () => {
  it('多层继承', async () => {
    const app = getApp();
    // make request
    const result = await createHttpRequest(app).get('/a/a1/a3/info');
    // use expect by jest
    assert(result.status === 200);
    assert(result.text === '多层继承');
  });
  it('单层继承', async () => {
    const app = getApp();
    // make request
    const result = await createHttpRequest(app).get('/b/b1/info');
    // use expect by jest
    assert(result.status === 200);
    assert(result.text === '单层继承');
  });
});
