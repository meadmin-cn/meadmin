import { formatWhere } from '@/helper/formWhere.js';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { InjectRepository } from '@/decorators/index.js';
import { Provide } from '@midwayjs/core';
import { UserCreateDto } from '../dto/userCreate.dto.js';
import { UserQueryDto } from '../dto/userQuery.dto.js';
import { UserUpdateDto } from '../dto/userUpdate.dto.js';
import { User } from '../../../entities/user.entity.js';


@Provide()
export class UserService {
  @InjectRepository(User)
  UserRepository: typeof User

  /**
   * 创建数据
   * @param createDto
   * @returns
   */
  async create(createDto: UserCreateDto) {
    const entity = this.UserRepository.build(createDto);
    return await entity.save();
  }

  private formatWhere(query: UserQueryDto) {
    return formatWhere(
      Object.assign({}, query, { page: undefined, size: undefined }),
      { likeField:[] }//模糊搜索的字段
    );
  }

  /**
   * 分页查询数据
   * @param queryDto 查询条件
   * @returns
   */
  findAll(queryDto: UserQueryDto) {
    return this.UserRepository.findAll({
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
  count(queryDto: UserQueryDto) {
    return this.UserRepository.count({ where: this.formatWhere(queryDto) });
  }

  /**
   * 根据主键获取一条信息
   * @param id 主键
   * @returns
   */
  findOne(id: string) {
    return this.UserRepository.findByPk(id);
  }

  /**
   * 更新数据
   * @param id 主键
   * @param updateDto 数据对象
   * @returns
   */
  async update(id: string, updateDto: UserUpdateDto) {
    const entity = await this.UserRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError('没有对应的信息');
    }
    Object.assign(entity, updateDto, { id });
    return await entity.save();
  }

  /**
   * 删除数据
   * @param id 主键
   * @returns
   */
  async remove(id: string) {
    const entity = await this.UserRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError('没有对应的信息');
    }
    await entity.destroy();
    return true;
  }
}
