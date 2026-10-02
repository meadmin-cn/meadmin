import { InjectRepository } from '@/decorators/index.js';
import { AonCmsArticle } from '@/entities/aonCmsArticle.entity.js';
import { AonCmsCategory } from '@/entities/aonCmsCategory.entity.js';
import { Controller, Get, Param, Post, Query } from '@midwayjs/core';
import { Op } from '@sequelize/core';
import { isCmsVisible } from '../../../../admin/addons/cms/service/guard.js';
import { BaseController } from '../../../controller/base.controller.js';

// 下载中心不再单独维护资源表：直接复用「可下载」的文章（isDownload=true）作为数据源。
@Controller('addons/cms/download')
export class AonCmsPublicDownloadController extends BaseController {
  @InjectRepository(AonCmsArticle) repository: typeof AonCmsArticle;
  @InjectRepository(AonCmsCategory) categoryRepository: typeof AonCmsCategory;
  @Get('/')
  async list(@Query() query: { page?: number; pageSize?: number; keyword?: string; category?: string }) {
    const page = Math.max(Number(query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize) || 12, 1), 50);
    const where: { isDownload: boolean; status: number; categoryId?: unknown } = { isDownload: true, status: 2 };
    const and: Array<Record<string, unknown>> = [];
    if (query.keyword?.trim()) {
      const keyword = `%${query.keyword.trim()}%`;
      and.push({ [Op.or]: [{ title: { [Op.iLike]: keyword } }, { summary: { [Op.iLike]: keyword } }, { mdContent: { [Op.iLike]: keyword } }] });
    }
    // 前台按栏目名称分组，展开更多时回传栏目名，这里按标题反查栏目 ID。
    if (query.category?.trim()) {
      const category = await this.categoryRepository.findOne({ where: { title: query.category.trim() } });
      where.categoryId = category ? category.id : '__none__';
    }
    const { rows, count } = await this.repository.findAndCountAll({
      where: (and.length ? { ...where, [Op.and]: and } : where) as any,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [
        ['orderNum', 'DESC'],
        ['publishAt', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });
    const now = new Date();
    const visible = rows.filter((row) => isCmsVisible(row.status, row.publishAt, now));
    const titles = await this.categoryTitles(visible.map((row) => row.categoryId));
    return this.success({ list: visible.map((row) => this.publicRow(row, titles.get(row.categoryId ?? ''))), total: count, page, pageSize });
  }
  @Get('/info/:slug')
  async info(@Param('slug') slug: string) {
    const row = await this.repository.findOne({ where: { slug, isDownload: true, status: 2 } });
    if (!row || !isCmsVisible(row.status, row.publishAt)) return this.success({});
    const titles = await this.categoryTitles([row.categoryId]);
    return this.success(this.publicRow(row, titles.get(row.categoryId ?? '')));
  }
  @Post('/download/:slug')
  async download(@Param('slug') slug: string) {
    const row = await this.repository.findOne({ where: { slug, isDownload: true, status: 2 } });
    if (!row || !isCmsVisible(row.status, row.publishAt)) return this.success({});
    await row.increment('downloads');
    return this.success({ url: row.fileUrl, title: row.title, downloads: Number(row.downloads ?? 0) + 1 });
  }
  private async categoryTitles(ids: Array<string | null>) {
    const list = [...new Set(ids.filter(Boolean))] as string[];
    if (!list.length) return new Map<string, string>();
    const rows = await this.categoryRepository.findAll({ attributes: ['id', 'title'], where: { id: list } });
    return new Map(rows.map((row) => [row.id, row.title]));
  }
  private publicRow(row: AonCmsArticle, category = ''): Record<string, unknown> {
    return { id: row.id, title: row.title, slug: row.slug, category, version: '', summary: row.summary, mdContent: row.mdContent, coverUrl: row.coverUrl, fileUrl: row.fileUrl, fileName: row.fileName, downloads: row.downloads };
  }
}
