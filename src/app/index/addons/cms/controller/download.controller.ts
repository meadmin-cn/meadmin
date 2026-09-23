import { Controller, Get, Param, Post, Query } from '@midwayjs/core';
import { BaseController } from '../../../controller/base.controller.js';
import { AonCmsDownload } from '@/entities/aonCmsDownload.entity.js';
import { InjectRepository } from '@/decorators/index.js';
import { Op } from '@sequelize/core';

@Controller('addons/cms/download')
export class AonCmsPublicDownloadController extends BaseController {
  @InjectRepository(AonCmsDownload) repository: typeof AonCmsDownload;
  @Get('/')
  async list(@Query() query: { page?: number; pageSize?: number; keyword?: string; category?: string }) {
    const page = Math.max(Number(query.page) || 1, 1); const pageSize = Math.min(Math.max(Number(query.pageSize) || 12, 1), 50);
    const where: Record<string, unknown> = { status: 1 };
    if (query.keyword) where.title = { [Op.iLike]: `%${query.keyword}%` };
    if (query.category) where.category = query.category;
    const { rows, count } = await this.repository.findAndCountAll({ where, offset: (page - 1) * pageSize, limit: pageSize, order: [['orderNum', 'DESC'], ['createdAt', 'DESC']] });
    return this.success({ list: rows.map(row => this.publicRow(row)), total: count, page, pageSize });
  }
  @Get('/info/:slug')
  async info(@Param('slug') slug: string) { const row = await this.repository.findOne({ where: { slug, status: 1 } }); if (!row) return this.success({}); return this.success(this.publicRow(row)); }
  @Post('/download/:slug')
  async download(@Param('slug') slug: string) { const row = await this.repository.findOne({ where: { slug, status: 1 } }); if (!row) return this.success({}); await row.increment('downloads'); return this.success({ url: row.fileUrl, title: row.title }); }
  private publicRow(row: AonCmsDownload): Record<string, unknown> { return { id: row.id, title: row.title, slug: row.slug, category: row.category, version: row.version, summary: row.summary, mdContent: row.mdContent, coverUrl: row.coverUrl, fileUrl: row.fileUrl, downloads: row.downloads }; }
}
