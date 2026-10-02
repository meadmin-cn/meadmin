import { InjectRepository } from '@/decorators/index.js';
import { AonCmsDiyform } from '@/entities/aonCmsDiyform.entity.js';
import { AonCmsDiyformData } from '@/entities/aonCmsDiyformData.entity.js';
import { Body, Controller, Get, Inject, Param, Post, Query } from '@midwayjs/core';
import type { Context } from '@midwayjs/koa';
import { BadRequestError, NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { BaseController } from '../../../controller/base.controller.js';

/** 表单元数据（字段配置）结构，与后台一致 */
interface CmsDiyformField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  maxlength?: number;
  options?: string[];
  contact?: boolean;
}

/**
 * 前台自定义表单：留言板由后台「自定义表单」中标记为留言板的表单驱动。
 * 表单字段、提交按钮文案、是否审核全部来自后台配置。
 */
@Controller('addons/cms/diyform')
export class AonCmsPublicDiyformController extends BaseController {
  @Inject() ctx: Context;
  @InjectRepository(AonCmsDiyform) formRepository: typeof AonCmsDiyform;
  @InjectRepository(AonCmsDiyformData) dataRepository: typeof AonCmsDiyformData;

  /** 取启用的留言板表单定义 */
  private async messageForm() {
    return this.formRepository.findOne({ where: { isMessageBoard: true, status: 1 } });
  }

  private parseFields(raw: string): CmsDiyformField[] {
    try {
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? (parsed as CmsDiyformField[]) : [];
    } catch {
      return [];
    }
  }

  /** 留言板：返回表单定义 + 已通过审核的公开数据 */
  @Get('/message')
  async message(@Query() query: { page?: number; pageSize?: number }): Promise<unknown> {
    const form = await this.messageForm();
    if (!form) return this.success({ form: null, list: [], total: 0, page: 1, pageSize: 10 });
    const page = Math.max(Number(query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize) || 10, 1), 50);
    const { rows, count } = await this.dataRepository.findAndCountAll({ where: { formId: form.id, status: 1 }, offset: (page - 1) * pageSize, limit: pageSize, order: [['createdAt', 'DESC']] });
    const fields = this.parseFields(form.fields);
    const contentField = fields.find((field) => ['textarea', 'text'].includes(field.type) && !field.contact);
    return this.success({
      form: { id: form.id, title: form.title, diyname: form.diyname, description: form.description, submitText: form.submitText || '提交', needReview: form.needReview, fields },
      // author/content 为列表展示的便捷字段，原始提交内容一并返回便于扩展
      list: rows.map((row) => ({
        id: row.id,
        author: row.author,
        reply: row.reply,
        createdAt: row.createdAt,
        content: String((JSON.parse(row.data || '{}') as Record<string, unknown>)[contentField?.name ?? 'content'] ?? ''),
        data: JSON.parse(row.data || '{}') as Record<string, unknown>,
      })),
      total: count,
      page,
      pageSize,
    });
  }

  /** 按表单标识提交数据（前台自定义表单通用提交入口） */
  @Post('/:diyname')
  async submit(@Param('diyname') diyname: string, @Body() input: Record<string, unknown>): Promise<unknown> {
    const form = await this.formRepository.findOne({ where: { diyname, status: 1 } });
    if (!form) throw new NotFoundError('表单不存在或已停用');
    const fields = this.parseFields(form.fields);

    // 按字段配置校验并归一化提交内容，未声明的字段一律丢弃
    const data: Record<string, unknown> = {};
    let contact = '';
    for (const field of fields) {
      const raw = input?.[field.name];
      const isArrayField = field.type === 'checkbox';
      const value = isArrayField ? (Array.isArray(raw) ? raw.map((item) => String(item).slice(0, 200)) : []) : typeof raw === 'string' ? raw.trim() : raw === undefined || raw === null ? '' : String(raw).trim();
      const isEmpty = isArrayField ? !value.length : !String(value ?? '').length;
      if (field.required && isEmpty) throw new BadRequestError(`请填写${field.label}`);
      if (field.maxlength && typeof value === 'string' && value.length > field.maxlength) throw new BadRequestError(`${field.label}长度不能超过 ${field.maxlength} 个字符`);
      data[field.name] = value;
      if (field.contact) contact = String(value ?? '');
    }

    const nameField = fields.find((field) => !field.contact && ['text'].includes(field.type));
    // 来源记录便于后台区分提交入口
    const source = form.isMessageBoard ? '留言板' : form.title;
    const row = await this.dataRepository.create({ formId: form.id, diyname: form.diyname, data: JSON.stringify(data), author: String(data[nameField?.name ?? 'author'] ?? ''), contact, reply: '', source, ip: String(this.ctx?.ip ?? ''), status: form.needReview ? 0 : 1 });
    return this.success({ id: row.id, needReview: form.needReview });
  }
}
