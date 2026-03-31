import { InjectRepository } from '@/decorators/index.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { Op } from '@sequelize/core';
import { AonDoc } from '../../../../../entities/aonDoc.entity.js';

//文档
@Provide()
export class AonDocService {
  @InjectRepository(AonDoc)
  aonDocRepository: typeof AonDoc;

  @Inject()
  i18nService: MidwayI18nService;

  /**
   * 获取菜单树形结构
   * @param version string //版本标识
   * @returns
   */
  async menuTree(version: string) {
    return await this.aonDocRepository.getTree({
      attributes: ['id', 'title', 'parentId', 'type', 'contentType', 'link', 'version', 'label'],
      include: [
        {
          association: 'icon',
          attributes: { exclude: [] }, //必须设置attributes，否则file的附件属性 url属性返回给前端时没有，已提交[BUG反馈](https://github.com/sequelize/sequelize/issues/18059)
        },
      ],
      order: [['orderNum', 'DESC']],
      where: { version },
    });
  }

  /**
   * 获取内容
   * @param id id
   * @returns
   */
  async getContent(version: string, labelOrId: string) {
    const entity = await this.aonDocRepository.findOne({
      where: {
        contentType: 0,
        version,
        [Op.or]: {
          id: labelOrId,
          label: labelOrId,
        },
      },
      attributes: ['type', 'contentType', 'mdContent', 'title', 'version', 'label'],
    });
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    return entity;
  }
}
