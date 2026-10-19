import { InjectRepository } from '@/decorators/index.js';
import { AonCmsDiyform } from '@/entities/aonCmsDiyform.entity.js';
import { AonCmsDiyformData } from '@/entities/aonCmsDiyformData.entity.js';
import { Body, Controller, Get, Inject, Param, Post, Query } from '@midwayjs/core';
import { BadRequestError, NotFoundError } from '@midwayjs/core/dist/error/http.js';
import type { Context } from '@midwayjs/koa';
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
  /** 前台展示角色：title标题 body正文 meta辅助信息 normal普通信息 hidden仅后台可见 */
  displayRole?: 'title' | 'body' | 'meta' | 'normal' | 'hidden';
}

/** 表单前台展示配置（缺省值与后台一致） */
interface CmsDiyformDisplayConfig {
  layout: string;
  showAvatar: boolean;
  showTime: boolean;
  pageSize: number;
  emptyText: string;
}
const defaultDisplayConfig: CmsDiyformDisplayConfig = { layout: 'card', showAvatar: true, showTime: true, pageSize: 10, emptyText: '暂无公开数据' };

/**
 * 前台自定义表单：留言板由后台「自定义表单」中标记为留言板的表单驱动。
 * 表单字段、提交按钮文案、是否审核全部来自后台配置。
 */
@Controller('addons/cms/diyform')
export class AonCmsPublicDiyformController extends BaseController {
  @Inject() ctx: Context;
  @InjectRepository(AonCmsDiyform) formRepository: typeof AonCmsDiyform;
  @InjectRepository(AonCmsDiyformData) dataRepository: typeof AonCmsDiyformData;

  private parseFields(raw: string): CmsDiyformField[] {
    try {
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? (parsed as CmsDiyformField[]) : [];
    } catch {
      return [];
    }
  }

  /** 解析前台展示配置，非法 JSON 或字段缺失时回退默认值 */
  private parseDisplayConfig(raw: string): CmsDiyformDisplayConfig {
    let parsed: Partial<CmsDiyformDisplayConfig> = {};
    try {
      const value = JSON.parse(raw || '{}');
      if (value && typeof value === 'object' && !Array.isArray(value)) parsed = value as Partial<CmsDiyformDisplayConfig>;
    } catch {
      parsed = {};
    }
    return {
      layout: typeof parsed.layout === 'string' && parsed.layout ? parsed.layout : defaultDisplayConfig.layout,
      showAvatar: typeof parsed.showAvatar === 'boolean' ? parsed.showAvatar : defaultDisplayConfig.showAvatar,
      showTime: typeof parsed.showTime === 'boolean' ? parsed.showTime : defaultDisplayConfig.showTime,
      pageSize: Number.isFinite(Number(parsed.pageSize)) && Number(parsed.pageSize) > 0 ? Math.min(Math.max(Number(parsed.pageSize), 1), 50) : defaultDisplayConfig.pageSize,
      emptyText: typeof parsed.emptyText === 'string' && parsed.emptyText ? parsed.emptyText : defaultDisplayConfig.emptyText,
    };
  }

  /** 表单定义 + 已通过审核的公开数据（留言板与按标识访问共用同一套输出） */
  private async publicPage(form: AonCmsDiyform | null, query: { page?: number; pageSize?: number }): Promise<unknown> {
    const page = Math.max(Number(query?.page) || 1, 1);
    if (!form) return this.success({ form: null, list: [], total: 0, page, pageSize: defaultDisplayConfig.pageSize });
    const fields = this.parseFields(form.fields);
    const displayConfig = this.parseDisplayConfig(form.displayConfig);
    // 未显式传 pageSize 时按表单展示配置分页，保证前台分页条与实际数据量一致
    const pageSize = Math.min(Math.max(Number(query?.pageSize) || displayConfig.pageSize, 1), 50);
    const { rows, count } = await this.dataRepository.findAndCountAll({ where: { formId: form.id, status: 1 }, offset: (page - 1) * pageSize, limit: pageSize, order: [['createdAt', 'DESC']] });
    // 正文优先取多行文本域（textarea），仅在表单没有 textarea 时才回退到单行文本。
    // 直接用 ['textarea','text'].includes() 会按字段声明顺序命中 author 这类单行字段，导致列表正文显示成用户名。
    const contentField = fields.find((field) => field.type === 'textarea' && !field.contact) ?? fields.find((field) => field.type === 'text' && !field.contact);
    return this.success({
      form: { id: form.id, title: form.title, diyname: form.diyname, description: form.description, submitText: form.submitText || '提交', needReview: form.needReview, fields, displayConfig },
      // author/content 为列表展示的便捷字段，原始提交内容一并返回便于扩展
      list: rows.map((row) => ({
        id: row.id,
        author: row.author,
        reply: row.reply,
        createdAt: row.createdAt,
        content: (() => {
          const value = (JSON.parse(row.data || '{}') as Record<string, unknown>)[contentField?.name ?? 'content'];
          if (value == null) return '';
          return typeof value === 'string' ? value : JSON.stringify(value);
        })(),
        data: JSON.parse(row.data || '{}') as Record<string, unknown>,
      })),
      total: count,
      page,
      pageSize,
    });
  }

  /** 按表单标识取表单定义与公开数据，供每个自定义表单的前台独立访问页使用 */
  @Get('/:diyname')
  async detail(@Param('diyname') diyname: string, @Query() query: { page?: number; pageSize?: number }): Promise<unknown> {
    const form = await this.formRepository.findOne({ where: { diyname, status: 1 } });
    if (!form) throw new NotFoundError('表单不存在或已停用');
    return this.publicPage(form, query);
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
      const value = isArrayField ? (Array.isArray(raw) ? raw.map((item) => (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean' ? String(item).slice(0, 200) : '')).filter(Boolean) : []) : typeof raw === 'string' ? raw.trim() : typeof raw === 'number' || typeof raw === 'boolean' ? String(raw) : '';
      const isEmpty = isArrayField ? !value.length : !String(value ?? '').length;
      if (field.required && isEmpty) throw new BadRequestError(`请填写${field.label}`);
      if (field.maxlength && typeof value === 'string' && value.length > field.maxlength) throw new BadRequestError(`${field.label}长度不能超过 ${field.maxlength} 个字符`);
      data[field.name] = value;
      if (field.contact) contact = String(value ?? '');
    }

    const nameField = fields.find((field) => !field.contact && ['text'].includes(field.type));
    // 来源记录便于后台区分提交入口
    const source = form.isMessageBoard ? '留言板' : form.title;
    const authorValue = data[nameField?.name ?? 'author'];
    const author = typeof authorValue === 'string' || typeof authorValue === 'number' || typeof authorValue === 'boolean' ? String(authorValue) : '';
    const row = await this.dataRepository.create({ formId: form.id, diyname: form.diyname, data: JSON.stringify(data), author, contact, reply: '', source, ip: String(this.ctx?.ip ?? ''), status: form.needReview ? 0 : 1 });
    return this.success({ id: row.id, needReview: form.needReview });
  }
}
