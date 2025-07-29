import { Admin } from '@/entities/admin.entity.js';
import { Inject, Provide } from '@midwayjs/core';
import { AdminCreateDto } from '../dto/adminCreate.dto.js';
import { AdminQueryDto } from '../dto/adminQuery.dto.js';
import { formatWhere } from '@/helper/formWhere.js';
import { AdminUpdateDto } from '../dto/adminUpdate.dto.js';
import { InjectRepository } from '@/decorators/index.js';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { LoginService } from './login.server.js';

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

  private formatWhere(query: Partial<AdminQueryDto>) {
    return formatWhere(Object.assign({}, query, { page: undefined, size: undefined }), { likeField: ['nickname', 'username'] });
  }

  /**
   * 分页查询数据
   * @param queryDto 查询条件
   * @returns
   */
  findAll(queryDto: AdminQueryDto) {
    return this.adminRepository.findAll({
      offset: (queryDto.page - 1) * queryDto.size,
      limit: queryDto.size,
      where: this.formatWhere(queryDto),
    });
  }

  /**
   * 获取数量
   * @param queryDto 查询条件
   * @returns
   */
  count(queryDto: Partial<AdminUpdateDto>) {
    return this.adminRepository.count({ where: this.formatWhere(queryDto) });
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
