import { Admin } from '@/entities/admin.entity.js';
import { Inject, Provide } from '@midwayjs/core';
import { AdminCreateDto } from '../dto/adminCreate.dto.js';
import { AdminUpdateDto } from '../dto/adminUpdate.dto.js';
import { InjectRepository } from '@/decorators/index.js';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { LoginService } from './login.server.js';
import { Op, WhereOptions } from '@sequelize/core';
import { AdminQueryDto } from '../dto/adminQuery.dto.js';

@Provide()
export class AdminService {
  @InjectRepository(Admin)
  adminRepository: typeof Admin;

  @Inject()
  loginService: LoginService;

  /**
   * 创建数据
   * @param createAdminDto
   * @returns
   */
  async create(createDto: AdminCreateDto) {
    const entity = this.adminRepository.build(Object.assign(createDto, this.loginService.entityPassword(createDto.password)));
    return await entity.save();
  }

  /**
   * 列表分页查询
   * @param queryDto
   * @returns
   */
  async list(queryDto: AdminQueryDto) {
    const where = {};
    Object.keys(queryDto).forEach((key) => {
      if (key === 'page') {
        return;
      }
      if (key === 'size') {
        return;
      }
      if (key === 'startCreateAt') {
        where['createAt'] = where['createAt'] ?? {};
        where['createAt'][Op.gte] = queryDto[key];
      }
      if (key === 'endCreateAt') {
        where['createAt'] = where['createAt'] ?? {};
        where['createAt'][Op.lte] = queryDto[key];
      }
      if (key === 'startUpdateAt') {
        where['updateAt'] = where['updateAt'] ?? {};
        where['updateAt'][Op.gte] = queryDto[key];
      }
      if (key === 'endUpdateAt') {
        where['updateAt'] = where['updateAt'] ?? {};
        where['updateAt'][Op.lte] = queryDto[key];
      }
    });
    return {
      list: await this.findAll(where, queryDto.page, queryDto.size),
      total: await this.count(where),
      page: queryDto.page,
      size: queryDto.size,
    };
  }

  /**
   * 分页查询数据
   * @param queryDto 查询条件
   * @returns
   */
  findAll(queryWhere: WhereOptions<Admin>, page: number, size: number) {
    return this.adminRepository.findAll({
      offset: (page - 1) * size,
      limit: size,
      where: queryWhere,
    });
  }

  /**
   * 获取数量
   * @param queryWhere 查询条件
   * @returns
   */
  count(queryWhere: WhereOptions<Admin>) {
    return this.adminRepository.count({ where: queryWhere });
  }

  /**
   * 根据主键获取一条信息
   * @param id 主键id
   * @returns
   */
  findOne(id: string) {
    return this.adminRepository.findByPk(id);
  }

  /**
   * 更新数据
   * @param id 主键id
   * @param updateDto 数据对象
   * @returns
   */
  async update(id: string, updateDto: AdminUpdateDto) {
    const entity = await this.adminRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError('没用对应的信息');
    }
    Object.assign(entity, updateDto, { id });
    if (updateDto.password) {
      entity.password = this.loginService.entityPassword(updateDto.password, entity.salt).password;
    }
    return await entity.save();
  }

  /**
   * 删除数据
   * @param id 主键id
   * @returns
   */
  async remove(id: string) {
    const entity = await this.adminRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError('没用对应的信息');
    }
    await entity.destroy();
    return Boolean(entity.deletedAt);
  }
}
