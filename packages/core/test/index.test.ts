import { createLightApp } from '@midwayjs/mock';
import * as custom from '../src';
import assert from 'assert';
describe('/test/index.test.ts', () => {
  it('test component', async () => {
    const app = await createLightApp('', {
      imports: [
        custom
      ]
    });
    const bookService = await app.getApplicationContext().getAsync(custom.BookService);
    assert(await bookService.getBookById() === 'hello world');
  });
});
