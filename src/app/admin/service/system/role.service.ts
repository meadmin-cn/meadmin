import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { InjectRepository } from '@/decorators/index.js';
import { Provide, Inject } from '@midwayjs/core';
import { SystemRoleCreateDto } from '../../dto/system/roleCreate.dto.js';
import { SystemRoleQueryDto } from '../../dto/system/roleQuery.dto.js';
import { SystemRoleUpdateDto } from '../../dto/system/roleUpdate.dto.js';
import { SystemRole } from '../../../../entities/systemRole.entity.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { Op } from '@sequelize/core';
import { SystemMenu } from '@/entities/systemMenu.entity.js';

//角色
@Provide()
export class SystemRoleService {
  @InjectRepository(SystemRole)
  SystemRoleRepository: typeof SystemRole;

  @InjectRepository(SystemMenu)
  SystemMenuRepository: typeof SystemMenu;

  @Inject()
  i18nService: MidwayI18nService;

  /**
   * 创建数据
   * @param createDto
   * @returns
   */
  async create(createDto: SystemRoleCreateDto) {
    const entity = this.SystemRoleRepository.build(createDto);
    return await entity.save();
  }

  /**
   * 列表分页查询
   * @param queryDto 查询条件
   * @returns
   */
  async list(queryDto: SystemRoleQueryDto) {
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
    const { count, rows } = await this.SystemRoleRepository.findAndCountAll({
      where,
      include:['createdAdmin','updatedAdmin'],
      offset: (queryDto.page - 1) * queryDto.pageSize,
      limit: queryDto.pageSize,
      order: [['orderNum', 'DESC']],
    });
    return {
      list: rows,
      total: count,
      page: queryDto.page,
      pageSize: queryDto.pageSize,
    };
  }

  /**
   * 获取角色树形结构
   * @returns 
   */
  async treeAll(){
    const list =  await this.SystemRoleRepository.getTree({
      order: [['orderNum', 'DESC']],
      include:{//关联查询菜单
        association:'menus',
        attributes:['id'],
      }
    });
    const menusAll = await this.SystemMenuRepository.findAll({attributes:['id']});
    const deepSetSuper = (arr: typeof list)=>{
      arr.forEach(item => {
        if(item.children){
          deepSetSuper(item.children);
        }
        if(item.isSuper){
          item.menus = menusAll;
        }
      });
    }
    deepSetSuper(list);
    return list;
  }

  /**
   * 根据主键获取一条信息
   * @param id 主键
   * @returns
   */
  async findOne(id: string) {
    const entity = await this.SystemRoleRepository.findByPk(id,{include:['parent','createdAdmin','updatedAdmin']});
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
  async update(id: string, updateDto: SystemRoleUpdateDto) {
    const entity = await this.SystemRoleRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    updateDto.isSuper = entity.isSuper;
    if(updateDto.menuIds){
      await entity.setMenus(updateDto.menuIds);
      entity.menus = await entity.getMenus();
      if(Object.keys(updateDto).length === 1){
        return entity;
      }
    }
    Object.assign(entity, updateDto);
    return await entity.save();
  }

  /**
   * 删除数据
   * @param id 主键
   * @returns
   */
  async remove(id: string) {
    const entity = await this.SystemRoleRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    await entity.destroy();
  }
}
