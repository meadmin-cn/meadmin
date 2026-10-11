import { InjectRepository } from '@/decorators/index.js';
import { AonCmsCategory } from '@/entities/aonCmsCategory.entity.js';
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
  @InjectRepository(AonCmsCategory) categoryRepository: typeof AonCmsCategory;
  @InjectRepository(AonCmsDiyformData) dataRepository: typeof AonCmsDiyformData;

  async list(input: { page: number; pageSize: number; keyword?: string; status?: number; categoryId?: string }) {
    const page = Math.max(1, Number(input?.page) || 1);
    const pageSize = Math.min(200, Math.max(1, Number(input?.pageSize) || 10));
    const where: WhereOptions<Attributes<AonCmsDiyform>> = {};
    if (input?.keyword) where.title = { [Op.iLike]: '%' + input.keyword + '%' };
    if (input?.status !== undefined && input.status !== null) where.status = Number(input.status);
    // 左侧栏目树筛选：表单只挂在「4 自定义表单」型栏目下，与文章按栏目过滤同一套逻辑
    if (input?.categoryId) where.categoryId = input.categoryId;
    const { rows, count } = await this.repository.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [
        ['orderNum', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });
    // 回显所属栏目名称，列表直接展示表单挂在哪个栏目下
    const catIds = [...new Set(rows.map((row) => row.categoryId).filter(Boolean))] as string[];
    const cats = catIds.length ? await this.categoryRepository.findAll({ where: { id: { [Op.in]: catIds } } }) : [];
    const catMap = new Map(cats.map((cat) => [cat.id, cat.title]));
    // 附带每个表单的提交数据量，便于列表直接判断使用情况
    const list = await Promise.all(
      rows.map(async (row) => {
        const plain = row.get({ plain: true }) as Record<string, unknown>;
        return { ...plain, categoryTitle: row.categoryId ? (catMap.get(row.categoryId) ?? '') : '', dataCount: await this.dataRepository.count({ where: { formId: row.id } }) };
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

  // 所属栏目校验：表单只能挂在「4 自定义表单」型栏目下，与列表左侧栏目树的可选范围保持一致
  private async assertCategory(categoryId?: string | null) {
    if (!categoryId) return null;
    const category = await this.categoryRepository.findByPk(categoryId);
    if (!category) throw new BadRequestError('所选栏目不存在');
    if (category.type !== 4) throw new BadRequestError('自定义表单只能关联「自定义表单」型栏目');
    return category;
  }
  // 内容侧与栏目侧保持一致：栏目.target 表示前台菜单点击后跳转的表单，
  // 表单改挂栏目时清空旧栏目的指向，改挂到空指向栏目时自动补上，避免前台菜单点开是空链接。
  private async syncCategoryTarget(next: string | null, prev: string | null, formId: string) {
    if (prev && prev !== next) {
      const old = await this.categoryRepository.findByPk(prev);
      if (old && old.target === formId) await old.update({ target: '' });
    }
    if (next) {
      const category = await this.categoryRepository.findByPk(next);
      if (category && !category.target) await category.update({ target: formId });
    }
  }

  async save(id: string | undefined, input: AonCmsDiyformSaveDto) {
    const data = validateCms<AonCmsDiyformSaveDto>(diyformSchema, input);
    this.parseFields(data.fields);
    await this.assertCategory(data.categoryId ?? null);
    const duplicate = await this.repository.findOne({ where: { diyname: data.diyname, ...(id ? { id: { [Op.ne]: id } } : {}) } });
    if (duplicate) throw new BadRequestError('表单标识已存在');
    // 留言板在站点内唯一，避免前台取到多个表单
    if (data.isMessageBoard) {
      const exists = await this.repository.findOne({ where: { isMessageBoard: true, ...(id ? { id: { [Op.ne]: id } } : {}) } });
      if (exists) throw new BadRequestError('已存在留言板表单，请先取消原表单的留言板标记');
    }
    const prevCategoryId = id ? (await this.info(id)).categoryId ?? null : null;
    const values = { title: data.title, diyname: data.diyname, description: data.description, fields: data.fields, submitText: data.submitText, needReview: data.needReview, isMessageBoard: data.isMessageBoard, status: data.status, orderNum: data.orderNum, categoryId: data.categoryId ?? null };
    const saved = id ? await (await this.info(id)).update(values) : await this.repository.create(values);
    await this.syncCategoryTarget(values.categoryId, prevCategoryId, saved.id);
    return saved;
  }

  async remove(id: string) {
    const row = await this.info(id);
    if (row.isMessageBoard) throw new BadRequestError('前台留言板正在使用该表单，不能删除');
    if (await this.dataRepository.count({ where: { formId: id } })) throw new BadRequestError('该表单下已有提交数据，请先清空数据');
    // 表单删除后，原来指向它的栏目不能再作为菜单跳转目标，否则前台点击得到空链接
    const referencing = await this.categoryRepository.findAll({ where: { type: 4, target: id } });
    for (const category of referencing) await category.update({ target: '' });
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
