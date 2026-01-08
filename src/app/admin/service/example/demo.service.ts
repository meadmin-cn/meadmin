import { InjectRepository, Transaction } from '@/decorators/index.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { Op } from '@sequelize/core';
import { ExampleBook } from '../../../../entities/exampleBook.entity.js';
import { ExampleDemo } from '../../../../entities/exampleDemo.entity.js';
import { User } from '../../../../entities/user.entity.js';
import { ExampleDemoCreateDto } from '../../dto/example/demoCreate.dto.js';
import { ExampleDemoQueryDto } from '../../dto/example/demoQuery.dto.js';
import { ExampleDemoUpdateDto } from '../../dto/example/demoUpdate.dto.js';

//示例_Demo
@Provide()
export class ExampleDemoService {
  @InjectRepository(ExampleDemo)
  exampleDemoRepository: typeof ExampleDemo;

  @Inject()
  i18nService: MidwayI18nService;

  //查询belongsTo关联模型user用户
  @InjectRepository(User)
  userRepository: typeof User;

  /**
   * 获取用户信息
   * @param queryDto
   * @returns
   */
  @Transaction()
  async getUser(page: number, pageSize: number, id: string, username: string = '') {
    const where = {};
    if (id) {
      where['id'] = id;
    }
    if (username) {
      where['username'] = { [Op.like]: '%' + username + '%' };
    }
    const { count, rows } = await this.userRepository.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });
    return {
      list: rows,
      total: count,
      page: page,
      pageSize: pageSize,
    };
  }

  //查询belongsToMany关联模型books示例_书籍
  @InjectRepository(ExampleBook)
  exampleBookRepository: typeof ExampleBook;

  /**
   * 获取示例_书籍信息
   * @param queryDto
   * @returns
   */
  @Transaction()
  async getExampleBook(page: number, pageSize: number, id: string, name: string = '') {
    const where = {};
    if (id) {
      where['id'] = id;
    }
    if (name) {
      where['name'] = { [Op.like]: '%' + name + '%' };
    }
    const { count, rows } = await this.exampleBookRepository.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });
    return {
      list: rows,
      total: count,
      page: page,
      pageSize: pageSize,
    };
  }

  /**
   * 创建数据
   * @param createDto
   * @returns
   */
  @Transaction()
  async create(createDto: ExampleDemoCreateDto) {
    const entity = await this.exampleDemoRepository.create(createDto);

    if (createDto.user) {
      //关联模型用主键进行设置，用对象设置时必须确保对象为模型model的实例
      await entity.setUser(createDto.user.id);
    }

    if (createDto.avatar) {
      //关联模型用主键进行设置，用对象设置时必须确保对象为模型model的实例
      await entity.setAvatar(createDto.avatar.id);
    }

    if (createDto.books) {
      //关联模型用主键进行设置，用对象设置时必须确保对象为模型model的实例
      await entity.setBooks(createDto.books.map((v) => v.id));
    }

    if (createDto.files) {
      //关联模型用主键进行设置，用对象设置时必须确保对象为模型model的实例
      await entity.setFiles(createDto.files.map((v) => v.id));
    }

    return entity;
  }

  /**
   * 列表分页查询
   * @param queryDto 查询条件
   * @returns
   */
  @Transaction()
  async list(queryDto: ExampleDemoQueryDto) {
    const where = {};
    Object.keys(queryDto).forEach((key) => {
      if (['page', 'pageSize'].includes(key)) {
        return;
      }
      if ([null, undefined, ''].includes(queryDto[key])) {
        return;
      }
      if (key === 'startCreatedAt') {
        where['createdAt'] = where['createdAt'] ?? {};
        where['createdAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endCreatedAt') {
        where['createdAt'] = where['createdAt'] ?? {};
        where['createdAt'][Op.lte] = queryDto[key];
        return;
      }
      if (key === 'startUpdatedAt') {
        where['updatedAt'] = where['updatedAt'] ?? {};
        where['updatedAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endUpdatedAt') {
        where['updatedAt'] = where['updatedAt'] ?? {};
        where['updatedAt'][Op.lte] = queryDto[key];
        return;
      }
      where[key] = queryDto[key];
    });
    const { count, rows } = await this.exampleDemoRepository.findAndCountAll({
      where,
      offset: (queryDto.page - 1) * queryDto.pageSize,
      limit: queryDto.pageSize,
      include: ['createdAdmin', 'updatedAdmin', 'books', 'booksExampleDemos', 'bookExampleDemo', 'user', 'avatar', 'files', 'filesExampleDemos', 'fileExampleDemo'],
      order: [['createdAt', 'DESC']],
    });
    return {
      list: rows,
      total: count,
      page: queryDto.page,
      pageSize: queryDto.pageSize,
    };
  }

  /**
   * 根据主键获取一条信息
   * @param id 主键
   * @returns
   */
  @Transaction()
  async findOne(id: string) {
    const entity = await this.exampleDemoRepository.findByPk(id, {
      include: ['createdAdmin', 'updatedAdmin', 'books', 'booksExampleDemos', 'bookExampleDemo', 'user', 'avatar', 'files', 'filesExampleDemos', 'fileExampleDemo'],
    });
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    return entity;
  }

  /**
   * 更新数据
   * @param id 主键
   * @param updateDto 数据对象
   * @returns
   */
  @Transaction()
  async update(id: string, updateDto: ExampleDemoUpdateDto) {
    const entity = await this.exampleDemoRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    Object.assign(entity, updateDto);

    if (updateDto.user !== undefined) {
      //关联模型用主键进行设置，用对象设置时必须确保对象为模型model的实例
      await entity.setUser(updateDto.user?.id ?? null);
    }

    if (updateDto.avatar !== undefined) {
      //关联模型用主键进行设置，用对象设置时必须确保对象为模型model的实例
      await entity.setAvatar(updateDto.avatar?.id ?? null);
    }

    if (updateDto.books) {
      //关联模型用主键进行设置，用对象设置时必须确保对象为模型model的实例
      await entity.setBooks(updateDto.books.map((v) => v.id));
    }

    if (updateDto.files) {
      //关联模型用主键进行设置，用对象设置时必须确保对象为模型model的实例
      await entity.setFiles(updateDto.files.map((v) => v.id));
    }

    return await entity.save();
  }

  /**
   * 删除数据
   * @param id 主键
   * @returns
   */
  @Transaction()
  async remove(id: string) {
    const entity = await this.exampleDemoRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    await entity.destroy();
  }
}
