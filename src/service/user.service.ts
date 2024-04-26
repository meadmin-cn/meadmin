import { Provide, Inject } from '@midwayjs/core';
import { IUserOptions } from '@/interface.js';
import { BookService } from '@meadmin/core';

@Provide()
export class UserService {
  @Inject()
  bookService: BookService;

  async getUser(options: IUserOptions) {
    return {
      uid: options.uid,
      username: 'mockedName2',
      phone: '1234567812232',
      email: 'xxx.xxx@xxx.1com',
      boodId: await this.bookService.getBookById(),
    };
  }
}
