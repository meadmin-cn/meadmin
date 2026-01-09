import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { InjectRepository } from '@/decorators/index.js';
import { Provide, Inject } from '@midwayjs/core';
import { UserCreateDto } from '../dto/userCreate.dto.js';
import { UserUpdateDto } from '../dto/userUpdate.dto.js';
import { User } from '../../../entities/user.entity.js';
import { LoginService } from './login.serveice.js';

//用户
@Provide()
export class UserService {
  @InjectRepository(User)
  UserRepository: typeof User;

  @Inject()
  loginService: LoginService;
    
  /**
   * 创建数据
   * @param createDto
   * @returns
   */
  async create(createDto: UserCreateDto) {
    if (createDto.avatar?.id !== undefined) {
      createDto.avatarFileId = createDto.avatar?.id ?? null;
    }
    if (createDto.password) {
      Object.assign(createDto, this.loginService.entityPassword(createDto.password));
    }
    const entity = this.UserRepository.build(createDto);
    return await entity.save();
  }


  /**
   * 根据主键获取一条信息
   * @param id 主键
   * @returns
   */
  async findOne(id: string) {
    const entity = await this.UserRepository.findByPk(id,{
       include: [{
          association: 'avatar',
          attributes: { exclude: [] }, //必须设置attributes，否则file的附件属性 url属性返回给前端时没有，已提交[BUG反馈](https://github.com/sequelize/sequelize/issues/18059)
        },]
    });
    if (!entity) {
      throw new BadRequestError('没有对应的信息');
    }
    return entity;
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
    if(entity.username != updateDto.username && updateDto.username !== undefined){
      if(await this.UserRepository.findOne({where:{username:updateDto.username}})){
        throw new BadRequestError('用户名已被占用');
      }
    }
    const password = entity.password;
    const salf = entity.salt;
    if (updateDto.avatar !== undefined) {
      updateDto.avatarFileId = updateDto.avatar?.id ?? null;
    }
    Object.assign(entity, updateDto);
    if (updateDto.password) {
        if (!this.loginService.checkPassword(updateDto.orgPassword, salf, password)) {
          throw new BadRequestError('原始密码错误');
        }
      Object.assign(entity, this.loginService.entityPassword(updateDto.password));
    } else {
      entity.password = password;
      entity.salt = salf;
    }
    return await entity.save();
  }

}
