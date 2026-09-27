import { InjectRepository } from '@/decorators/index.js';
import { AonCmsDownload } from '@/entities/aonCmsDownload.entity.js';
import { Provide } from '@midwayjs/core';
import { NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { Op } from '@sequelize/core';
import { CmsQueryDto, querySchema } from '../dto/common.dto.js';
import { CmsDownloadSaveDto, downloadSchema } from '../dto/download.dto.js';
import { validateCms } from './guard.js';
@Provide()
export class AonCmsDownloadService {
  @InjectRepository(AonCmsDownload) repository: typeof AonCmsDownload;
  async list(input: CmsQueryDto) {
    const q = validateCms<CmsQueryDto>(querySchema, input);
    const where = { status: q.status ?? 1, ...(q.keyword ? { [Op.or]: [{ title: { [Op.iLike]: `%${q.keyword}%` } }, { summary: { [Op.iLike]: `%${q.keyword}%` } }, { category: { [Op.iLike]: `%${q.keyword}%` } }] } : {}) };
    const { rows, count } = await this.repository.findAndCountAll({
      where,
      offset: (q.page - 1) * q.pageSize,
      limit: q.pageSize,
      order: [
        ['orderNum', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });
    return { list: rows, total: count, page: q.page, pageSize: q.pageSize };
  }
  async info(id: string) {
    const row = await this.repository.findByPk(id);
    if (!row) throw new NotFoundError('下载资源不存在');
    return row;
  }
  async save(id: string | undefined, input: CmsDownloadSaveDto) {
    const data = validateCms<CmsDownloadSaveDto>(downloadSchema, input);
    const row = id ? await this.info(id) : null;
    return row ? row.update(data) : this.repository.create({ ...data, downloads: 0 });
  }
  async remove(id: string) {
    await (await this.info(id)).destroy();
  }
}
