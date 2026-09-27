import { InjectRepository } from '@/decorators/index.js';
import { AonCmsMessage } from '@/entities/aonCmsMessage.entity.js';
import { Body, Controller, Get, Post, Query } from '@midwayjs/core';
import { CmsMessageSaveDto, messageSchema } from '../../../../admin/addons/cms/dto/message.dto.js';
import { validateCms } from '../../../../admin/addons/cms/service/guard.js';
import { BaseController } from '../../../controller/base.controller.js';

@Controller('addons/cms/message')
export class AonCmsPublicMessageController extends BaseController {
  @InjectRepository(AonCmsMessage) repository: typeof AonCmsMessage;
  @Get('/')
  async list(@Query() query: { page?: number; pageSize?: number }): Promise<unknown> {
    const page = Math.max(Number(query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize) || 10, 1), 50);
    const { rows, count } = await this.repository.findAndCountAll({ where: { status: 1 }, offset: (page - 1) * pageSize, limit: pageSize, order: [['createdAt', 'DESC']] });
    return this.success({ list: rows.map((row) => ({ author: row.author, content: row.content, reply: row.reply, createdAt: row.createdAt })), total: count, page, pageSize });
  }
  @Post('/')
  async create(@Body() input: CmsMessageSaveDto): Promise<unknown> {
    const data = validateCms<CmsMessageSaveDto>(messageSchema, input);
    const row = await this.repository.create({ author: data.author, contact: data.contact, content: data.content, reply: '', status: 0 });
    return this.success({ id: row.id });
  }
}
