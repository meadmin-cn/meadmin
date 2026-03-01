import { InjectRepository } from '@/decorators/index.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { AonDoc } from '../../../../../entities/aonDoc.entity.js';

//文档
@Provide()
export class AonDocService {
  @InjectRepository(AonDoc)
  aonDocRepository: typeof AonDoc;

  @Inject()
  i18nService: MidwayI18nService;

  /**
   * 获取角色树形结构
   * @returns
   */
  async menuTree() {
    return await this.aonDocRepository.getTree({
      attributes: ['id', 'title', 'parentId', 'type', 'contentType', 'link'],
      include: [
        {
          association: 'icon',
          attributes: { exclude: [] }, //必须设置attributes，否则file的附件属性 url属性返回给前端时没有，已提交[BUG反馈](https://github.com/sequelize/sequelize/issues/18059)
        },
      ],
      order: [['orderNum', 'DESC']],
    });
  }

  /**
   * 获取内容
   * @param id id
   * @returns
   */
  async getContent(id: string) {
    const entity = await this.aonDocRepository.findByPk(id, {
      where: { contentType: 0 },
      attributes: ['type', 'contentType', 'mdContent', 'title'],
    });
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    return entity;
  }
}
