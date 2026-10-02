import { InjectRepository } from '@/decorators/index.js';
import { AonCmsDiyform } from '@/entities/aonCmsDiyform.entity.js';
import { AonCmsDiyformData } from '@/entities/aonCmsDiyformData.entity.js';
import { Provide } from '@midwayjs/core';
import { BadRequestError, NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { Attributes, Op, WhereOptions } from '@sequelize/core';
import { AonCmsDiyformDataQueryDto, AonCmsDiyformDataUpdateDto, AonCmsDiyformSaveDto, diyformDataQuerySchema, diyformDataUpdateSchema, diyformSchema } from '../dto/diyform.dto.js';
import { validateCms } from './guard.js';

/** 表单元数据（字段配置）结构 */
export interface CmsDiyformField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  maxlength?: number;
  options?: string[];
  /** 该字段是否作为「联系方式」抽取到列表列，仅后台可见 */
  contact?: boolean;
}

@Provide()
export class AonCmsDiyformService {
  @InjectRepository(AonCmsDiyform) repository: typeof AonCmsDiyform;
  @InjectRepository(AonCmsDiyformData) dataRepository: typeof AonCmsDiyformData;

  async list(input: { page: number; pageSize: number; keyword?: string; status?: number }) {
    const page = Math.max(1, Number(input?.page) || 1);
    const pageSize = Math.min(200, Math.max(1, Number(input?.pageSize) || 10));
    const where: WhereOptions<Attributes<AonCmsDiyform>> = {};
    if (input?.keyword) where.title = { [Op.iLike]: '%' + input.keyword + '%' };
    if (input?.status !== undefined && input.status !== null) where.status = Number(input.status);
    const { rows, count } = await this.repository.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [
        ['orderNum', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });
    // 附带每个表单的提交数据量，便于列表直接判断使用情况
    const list = await Promise.all(
      rows.map(async (row) => {
        const plain = row.get({ plain: true }) as Record<string, unknown>;
        return { ...plain, dataCount: await this.dataRepository.count({ where: { formId: row.id } }) };
      }),
    );
    return { list, total: count, page, pageSize };
  }

  async info(id: string) {
    const row = await this.repository.findByPk(id);
    if (!row) throw new NotFoundError('表单不存在');
    return row;
  }

  /** 校验字段配置：必须是数组，每项含 name/label/type，且 name 不重复 */
  private parseFields(raw: string): CmsDiyformField[] {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw || '[]');
    } catch {
      throw new BadRequestError('字段配置不是合法的 JSON');
    }
    if (!Array.isArray(parsed) || !parsed.length) throw new BadRequestError('请至少配置一个表单字段');
    const names = new Set<string>();
    return parsed.map((item) => {
      const field = item as CmsDiyformField;
      if (!field?.name || !field?.label || !field?.type) throw new BadRequestError('每个字段都必须包含 name、label、type');
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(field.name)) throw new BadRequestError(`字段名 ${field.name} 只能包含字母、数字与下划线，且以字母开头`);
      if (names.has(field.name)) throw new BadRequestError(`字段名 ${field.name} 重复`);
      names.add(field.name);
      return field;
    });
  }

  async save(id: string | undefined, input: AonCmsDiyformSaveDto) {
    const data = validateCms<AonCmsDiyformSaveDto>(diyformSchema, input);
    this.parseFields(data.fields);
    const duplicate = await this.repository.findOne({ where: { diyname: data.diyname, ...(id ? { id: { [Op.ne]: id } } : {}) } });
    if (duplicate) throw new BadRequestError('表单标识已存在');
    // 留言板在站点内唯一，避免前台取到多个表单
    if (data.isMessageBoard) {
      const exists = await this.repository.findOne({ where: { isMessageBoard: true, ...(id ? { id: { [Op.ne]: id } } : {}) } });
      if (exists) throw new BadRequestError('已存在留言板表单，请先取消原表单的留言板标记');
    }
    const values = { title: data.title, diyname: data.diyname, description: data.description, fields: data.fields, submitText: data.submitText, needReview: data.needReview, isMessageBoard: data.isMessageBoard, status: data.status, orderNum: data.orderNum };
    if (!id) return this.repository.create(values);
    return (await this.info(id)).update(values);
  }

  async remove(id: string) {
    const row = await this.info(id);
    if (row.isMessageBoard) throw new BadRequestError('前台留言板正在使用该表单，不能删除');
    if (await this.dataRepository.count({ where: { formId: id } })) throw new BadRequestError('该表单下已有提交数据，请先清空数据');
    await row.destroy();
  }

  // ---- 提交数据 ----

  async dataList(input: AonCmsDiyformDataQueryDto) {
    const q = validateCms<AonCmsDiyformDataQueryDto>(diyformDataQuerySchema, input);
    const where: WhereOptions<Attributes<AonCmsDiyformData>> = {};
    if (q.formId) where.formId = q.formId;
    if (q.diyname) where.diyname = q.diyname;
    if (q.status !== null && q.status !== undefined) where.status = q.status;
    if (q.keyword) {
      where[Op.or as never] = [{ author: { [Op.iLike]: `%${q.keyword}%` } }, { contact: { [Op.iLike]: `%${q.keyword}%` } }, { data: { [Op.iLike]: `%${q.keyword}%` } }] as never;
    }
    const { rows, count } = await this.dataRepository.findAndCountAll({ where, offset: (q.page - 1) * q.pageSize, limit: q.pageSize, order: [['createdAt', 'DESC']] });
    return { list: rows, total: count, page: q.page, pageSize: q.pageSize };
  }

  async dataInfo(id: string) {
    const row = await this.dataRepository.findByPk(id);
    if (!row) throw new NotFoundError('提交数据不存在');
    return row;
  }

  async dataUpdate(id: string, input: AonCmsDiyformDataUpdateDto) {
    const data = validateCms<AonCmsDiyformDataUpdateDto>(diyformDataUpdateSchema, input);
    const row = await this.dataInfo(id);
    const values: { status?: number; reply?: string } = {};
    if (data.status !== undefined) values.status = data.status;
    if (data.reply !== undefined) values.reply = data.reply;
    return row.update(values);
  }

  async dataRemove(id: string) {
    await (await this.dataInfo(id)).destroy();
  }

  /** 导出：按当前筛选条件返回全部数据（不分页），由控制器转 CSV */
  async dataExport(input: AonCmsDiyformDataQueryDto) {
    const q = validateCms<AonCmsDiyformDataQueryDto>(diyformDataQuerySchema, { ...input, page: 1, pageSize: 200 });
    const where: WhereOptions<Attributes<AonCmsDiyformData>> = {};
    if (q.formId) where.formId = q.formId;
    if (q.diyname) where.diyname = q.diyname;
    if (q.status !== null && q.status !== undefined) where.status = q.status;
    if (q.keyword) {
      where[Op.or as never] = [{ author: { [Op.iLike]: `%${q.keyword}%` } }, { contact: { [Op.iLike]: `%${q.keyword}%` } }, { data: { [Op.iLike]: `%${q.keyword}%` } }] as never;
    }
    const rows = await this.dataRepository.findAll({ where, order: [['createdAt', 'DESC']], limit: 20000 });
    const form = q.formId ? await this.repository.findByPk(q.formId) : q.diyname ? await this.repository.findOne({ where: { diyname: q.diyname } }) : null;
    const fields = form ? this.parseFields(form.fields) : [];
    return { rows, form, fields };
  }
}
