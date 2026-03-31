import { InjectRepository, Transaction } from '@/decorators/index.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { AonDocConfig } from '../../../../../entities/aonDocConfig.entity.js';

//配置
@Provide()
export class AonDocConfigService {
  @InjectRepository(AonDocConfig)
  aonDocConfigRepository: typeof AonDocConfig;

  @Inject()
  i18nService: MidwayI18nService;

  /**
   * 根据主键获取一条信息
   * @param id 主键
   * @returns
   */
  @Transaction()
  async findOne(id: string) {
    const entity = await this.aonDocConfigRepository.findByPk(id, {
      include: [
        'createdAdmin',
        'updatedAdmin',
        {
          association: 'icon',
          attributes: { exclude: [] }, //必须设置attributes，否则file的附件属性 url属性返回给前端时没有，已提交[BUG反馈](https://github.com/sequelize/sequelize/issues/18059)
        },
      ],
    });
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    return entity;
  }
}
