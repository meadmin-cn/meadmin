import { User } from '@/entities/user.entity.js';
import { Provide } from '@midwayjs/core';
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { UserCreateDto } from '../dto/userCreate.dto.js';
import { UserQueryDto } from '../dto/userQuery.dto.js';
import { formatWhere } from '@/helper/formWhere.js';
import { UserUpdateDto } from '../dto/userUpdate.dto.js';
import { ForbiddenError } from '@/error/forbiddenError.js';
import { InjectRepository } from '@/decorators/index.js';

@Provide()
export class UserService {
  @InjectRepository(User)
  UserRepository: typeof User

  /**
   * 密码加密
   * @param password 密码
   * @returns {salt:密码盐,password:密码密文}
   */
  private entityPassword(password: string, salt?: string) {
    let newSalt: string;
    if (salt) {
      newSalt = salt;
    } else {
      newSalt = randomBytes(32).toString();
    }
    const ciphertext = pbkdf2Sync(
      password,
      newSalt,
      1000,
      32,
      'sha3-256'
    ).toString();
    return { salt: newSalt, password: ciphertext };
  }

  /**
   * 校验密码
   * @param password 密码
   * @param salt 密码盐
   * @param encode 加密字符串
   * @returns 是否通过
   */
  public checkPassword(password: string, salt: string, encode: string) {
    return this.entityPassword(password, salt).password === encode;
  }

  /**
   * 创建数据
   * @param createAdminDto
   * @returns
   */
  async create(createDto: UserCreateDto) {
    const entity = this.UserRepository.build(
      Object.assign(createDto, this.entityPassword(createDto.password))
    );
    return await entity.save();
  }

  private formatWhere(query: Partial<UserQueryDto>) {
    return formatWhere(
      Object.assign({}, query, { page: undefined, size: undefined }),
      { likeField: ['nickname', 'username'] }
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
  count(queryDto: Partial<UserQueryDto>) {
    return this.UserRepository.count({ where: this.formatWhere(queryDto) });
  }

  /**
   * 根据主键获取一条信息
   * @param id 主键id
   * @returns
   */
  findOne(id: string) {
    return this.UserRepository.findByPk(id);
  }

  /**
   * 更新数据
   * @param id 主键id
   * @param updateDto 数据对象
   * @returns
   */
  async update(id: string, updateDto: UserUpdateDto) {
    const entity = await this.UserRepository.findByPk(id);
    if (!entity) {
      throw new ForbiddenError('没用对应的信息');
    }
    Object.assign(entity, updateDto, { id });
    if (updateDto.password) {
      entity.password = this.entityPassword(
        updateDto.password,
        entity.salt
      ).password;
    }
    return await entity.save();
  }

  /**
   * 删除数据
   * @param id 主键id
   * @returns
   */
  async remove(id: string) {
    const entity = await this.UserRepository.findByPk(id);
    if (!entity) {
      throw new ForbiddenError('没用对应的信息');
    }
    await entity.destroy();
    return Boolean(entity.deletedAt);
  }
}
