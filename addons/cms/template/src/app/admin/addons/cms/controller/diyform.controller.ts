import { AdminPermission } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { BaseController } from '../../../controller/base.controller.js';
import { AonCmsDiyformDataQueryDto, AonCmsDiyformDataUpdateDto, AonCmsDiyformSaveDto } from '../dto/diyform.dto.js';
import { AonCmsDiyformService, CmsDiyformField } from '../service/diyform.service.js';
import { CmsPermissionMiddleware } from './permission.middleware.js';

/** CSV 单元格转义：包裹双引号并转义内部引号，避免逗号/换行破坏结构 */
const csvCell = (value: unknown): string => `"${String(value ?? '').replace(/"/g, '""')}"`;

@Controller('addons/cms/diyform', { middleware: [CmsPermissionMiddleware] })
export class AonCmsDiyformController extends BaseController {
  @Inject() service: AonCmsDiyformService;

  @Post('/') @AdminPermission('aon_cms_diyform_list') async list(@Body() data: { page: number; pageSize: number; keyword?: string; status?: number }) {
    return this.success(await this.service.list(data));
  }
  @Get('/info/:id') @AdminPermission(['aon_cms_diyform_info', 'aon_cms_diyform_edit']) async info(@Param('id') id: string) {
    return this.success(await this.service.info(id));
  }
  @Post('/add') @AdminPermission('aon_cms_diyform_add') async add(@Body() data: AonCmsDiyformSaveDto) {
    return this.success(await this.service.save(undefined, data));
  }
  @Post('/up/:id') @AdminPermission('aon_cms_diyform_edit') async update(@Param('id') id: string, @Body() data: AonCmsDiyformSaveDto) {
    return this.success(await this.service.save(id, data));
  }
  @Post('/del/:id') @AdminPermission('aon_cms_diyform_del') async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return this.success();
  }

  // ---- 提交数据 ----
  @Post('/data') @AdminPermission('aon_cms_diyform_data_list') async dataList(@Body() data: AonCmsDiyformDataQueryDto) {
    return this.success(await this.service.dataList(data));
  }
  @Get('/data/info/:id') @AdminPermission(['aon_cms_diyform_data_info', 'aon_cms_diyform_data_edit', 'aon_cms_diyform_data_reply']) async dataInfo(@Param('id') id: string) {
    return this.success(await this.service.dataInfo(id));
  }
  @Post('/data/up/:id') @AdminPermission(['aon_cms_diyform_data_edit', 'aon_cms_diyform_data_review', 'aon_cms_diyform_data_reply']) async dataUpdate(@Param('id') id: string, @Body() data: AonCmsDiyformDataUpdateDto) {
    return this.success(await this.service.dataUpdate(id, data));
  }
  @Post('/data/del/:id') @AdminPermission('aon_cms_diyform_data_del') async dataRemove(@Param('id') id: string) {
    await this.service.dataRemove(id);
    return this.success();
  }
  /** 导出：按当前筛选条件输出 CSV（Excel 可直接打开），表头取自表单字段配置 */
  @Post('/data/export') @AdminPermission('aon_cms_diyform_data_export') async dataExport(@Body() data: AonCmsDiyformDataQueryDto) {
    const { rows, fields } = await this.service.dataExport(data);
    const columns: Array<{ key: string; label: string; get: (row: (typeof rows)[number]) => unknown }> = [
      ...fields.map((field: CmsDiyformField) => ({ key: field.name, label: field.label, get: (row: (typeof rows)[number]) => (JSON.parse(row.data || '{}') as Record<string, unknown>)[field.name] })),
      { key: 'status', label: '状态', get: (row) => ['待审核', '已通过', '已拒绝'][row.status] ?? '未知' },
      { key: 'reply', label: '管理员回复', get: (row) => row.reply },
      { key: 'source', label: '提交来源', get: (row) => row.source },
      { key: 'createdAt', label: '提交时间', get: (row) => new Date(row.createdAt).toISOString().replace('T', ' ').slice(0, 19) },
    ];
    const csv = ['\ufeff' + columns.map((column) => csvCell(column.label)).join(','), ...rows.map((row) => columns.map((column) => csvCell(column.get(row))).join(','))].join('\r\n');
    return this.success({ filename: `diyform-${Date.now()}.csv`, content: csv, total: rows.length });
  }
}
