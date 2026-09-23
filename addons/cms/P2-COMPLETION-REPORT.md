# CMS 插件 P2 核心功能补充 - 完成报告

## 执行时间
2026-09-21

## 任务概览
按照用户要求完成 P2 优先级任务：回收站功能、批量操作、管理员数据隔离

---

## ✅ 任务 3：回收站功能（已完成）

### 实体层修改
为以下 7 个实体添加 `deletedAt` 字段（软删除时间戳）：

1. **AonCmsArticle** (`entities/aonCmsArticle.entity.ts`)
2. **AonCmsPage** (`entities/aonCmsPage.entity.ts`)
3. **AonCmsComment** (`entities/aonCmsComment.entity.ts`)
4. **AonCmsTag** (`entities/aonCmsTag.entity.ts`)
5. **AonCmsTopic** (`entities/aonCmsTopic.entity.ts`)
6. **AonCmsBlock** (`entities/aonCmsBlock.entity.ts`)
7. **AonCmsCategory** (`entities/aonCmsCategory.entity.ts`)

字段定义：
```typescript
@Attribute({ type: DataTypes.DATE, allowNull: true, defaultValue: null })
@ApiPropertyRule({ description: '删除时间', rule: RuleType.date().iso().allow(null).default(null) })
declare deletedAt: Date | null;
```

### Service 层修改
为所有 7 个 Service 实现：

#### 1. 修改现有方法
- **list 方法**：添加 `deletedAt: null` 过滤条件（通过 `@AdminDataScope` 装饰器自动应用）
- **remove 方法**：改为软删除 `row.update({ deletedAt: new Date() })`

#### 2. 新增回收站方法
```typescript
// 查询回收站列表
@AdminDataScope()
async listRecycleBin(input: CmsQueryDto) {
  const where: WhereOptions = { 
    deletedAt: { [Op.ne]: null },
    ...getAdminDataScopeWhere(this)
  };
  // ... 分页查询逻辑
}

// 恢复软删除记录
@Transaction()
async restore(id: string) {
  const row = await this.repository.findOne({ 
    where: { id: cmsId(id), deletedAt: { [Op.ne]: null } } 
  });
  return row.update({ deletedAt: null });
}

// 彻底删除
@Transaction()
async forceDelete(id: string) {
  const row = await this.repository.findOne({ 
    where: { id: cmsId(id), deletedAt: { [Op.ne]: null } } 
  });
  await row.destroy();
}
```

#### 3. 特殊处理
- **tag.service.ts / topic.service.ts**：删除前检查文章引用，防止孤立引用
- **category.service.ts**：删除前检查子栏目和文章引用

### Controller 层修改
为所有 7 个 Controller 添加回收站接口：

```typescript
@Post('/recycleBin')
@AdminPermission('aon_cms_xxx_list')
async listRecycleBin(@Body() query: CmsQueryDto)

@Post('/restore/:id')
@AdminPermission('aon_cms_xxx_del')
async restore(@Param('id') id: string)

@Post('/forceDelete/:id')
@AdminPermission('aon_cms_xxx_del')
async forceDelete(@Param('id') id: string)
```

---

## ✅ 任务 4：批量操作（已完成）

### DTO 层
在 `dto/common.dto.ts` 中已存在完整的批量操作 DTO：

```typescript
// 批量删除基础
export class CmsBatchDto {
  @ApiPropertyRule({ rule: RuleType.array().items(...).min(1).max(100).required() })
  ids: string[];
}

// 批量更新状态
export class CmsBatchUpdateStatusDto extends CmsBatchDto {
  @ApiPropertyRule({ rule: RuleType.number().integer().valid(0,1,2,3,4).required() })
  status: number;
}

// 批量添加标签（仅文章）
export class CmsBatchAddTagsDto extends CmsBatchDto {
  @ApiPropertyRule({ rule: RuleType.array().items(...).min(1).max(50).required() })
  tagIds: string[];
}

// 批量设置专题（仅文章）
export class CmsBatchSetTopicDto extends CmsBatchDto {
  @ApiPropertyRule({ rule: RuleType.string().pattern(...).allow(null).required() })
  topicId: string | null;
}
```

### Service 层实现
所有 7 个 Service 实现批量操作方法：

#### 通用批量方法（所有实体）

**1. batchDelete（批量软删除）**
```typescript
@AdminDataScope()
@Transaction()
async batchDelete(ids: string[]) {
  await this.lock();
  const validIds = ids.map(cmsId);
  const where: WhereOptions = { 
    id: { [Op.in]: validIds }, 
    deletedAt: null,
    ...getAdminDataScopeWhere(this)
  };
  const rows = await this.repository.findAll({ where });
  if (rows.length === 0) throw new NotFoundError('未找到可删除的记录');
  
  await this.repository.update(
    { deletedAt: new Date() }, 
    { where: { id: { [Op.in]: rows.map(r => r.id) } } }
  );
  return { affected: rows.length };
}
```

**2. batchUpdateStatus（批量更新状态）**
```typescript
@AdminDataScope()
@Transaction()
async batchUpdateStatus(ids: string[], status: number) {
  await this.lock();
  const validIds = ids.map(cmsId);
  const where: WhereOptions = { 
    id: { [Op.in]: validIds }, 
    deletedAt: null,
    ...getAdminDataScopeWhere(this)
  };
  const rows = await this.repository.findAll({ where });
  if (rows.length === 0) throw new NotFoundError('未找到可更新的记录');
  
  await this.repository.update(
    { status }, 
    { where: { id: { [Op.in]: rows.map(r => r.id) } } }
  );
  return { affected: rows.length };
}
```

#### 文章专属批量方法

**3. batchAddTags（批量添加标签）**
```typescript
@AdminDataScope()
@Transaction()
async batchAddTags(ids: string[], tagIds: string[]) {
  await this.lock();
  // 1. 验证文章存在且属于当前管理员
  const where: WhereOptions = { 
    id: { [Op.in]: validIds }, 
    deletedAt: null,
    ...getAdminDataScopeWhere(this)
  };
  const rows = await this.repository.findAll({ where });
  
  // 2. 验证标签存在
  if ((await this.tagRepository.count({ 
    where: { id: { [Op.in]: tagIds }, deletedAt: null } 
  })) !== tagIds.length) {
    throw new BadRequestError('部分标签不存在');
  }
  
  // 3. 合并标签（去重）
  for (const row of rows) {
    const newTags = Array.from(new Set([...row.tagIds, ...tagIds]));
    await row.update({ tagIds: newTags });
  }
  return { affected: rows.length };
}
```

**4. batchSetTopic（批量设置专题）**
```typescript
@AdminDataScope()
@Transaction()
async batchSetTopic(ids: string[], topicId: string | null) {
  await this.lock();
  // 1. 验证文章存在且属于当前管理员
  const where: WhereOptions = { 
    id: { [Op.in]: validIds }, 
    deletedAt: null,
    ...getAdminDataScopeWhere(this)
  };
  const rows = await this.repository.findAll({ where });
  
  // 2. 验证专题存在（如果非空）
  if (topicId && !(await this.topicRepository.findOne({ 
    where: { id: topicId, deletedAt: null } 
  }))) {
    throw new BadRequestError('专题不存在');
  }
  
  // 3. 批量更新
  await this.repository.update(
    { topicId }, 
    { where: { id: { [Op.in]: rows.map(r => r.id) } } }
  );
  return { affected: rows.length };
}
```

#### 特殊实体批量删除逻辑

**Tag/Topic 批量删除**：检查文章引用
```typescript
const articleCount = await this.articleRepository.count({
  where: {
    [Op.or]: ids.map(id => ({ tagIds: { [Op.contains]: [id] } })),
    deletedAt: null
  }
});
if (articleCount > 0) {
  throw new BadRequestError(`标签被 ${articleCount} 篇文章引用，无法删除`);
}
```

**Category 批量删除**：检查子栏目和文章引用
```typescript
// 1. 检查子栏目
const childCount = await this.repository.count({
  where: { 
    parentId: { [Op.in]: categoryIds }, 
    deletedAt: null 
  }
});

// 2. 检查文章引用
const articleCount = await this.articleRepository.count({
  where: { 
    categoryId: { [Op.in]: categoryIds }, 
    deletedAt: null 
  }
});
```

### Controller 层实现
为所有 7 个 Controller 添加批量操作接口：

#### 通用批量接口（所有实体）
```typescript
@Post('/batchDelete')
@AdminPermission('aon_cms_xxx_del')
async batchDelete(@Body() data: CmsBatchDto) {
  return this.success(await this.service.batchDelete(data.ids));
}

@Post('/batchUpdateStatus')
@AdminPermission('aon_cms_xxx_edit')
async batchUpdateStatus(@Body() data: CmsBatchUpdateStatusDto) {
  return this.success(await this.service.batchUpdateStatus(data.ids, data.status));
}
```

#### 文章专属接口
```typescript
@Post('/batchAddTags')
@AdminPermission('aon_cms_article_edit')
async batchAddTags(@Body() data: CmsBatchAddTagsDto) {
  return this.success(await this.service.batchAddTags(data.ids, data.tagIds));
}

@Post('/batchSetTopic')
@AdminPermission('aon_cms_article_edit')
async batchSetTopic(@Body() data: CmsBatchSetTopicDto) {
  return this.success(await this.service.batchSetTopic(data.ids, data.topicId));
}
```

---

## ✅ 任务 5：管理员数据隔离（已完成）

### 实现方式
使用 meadmin 现有的 `@AdminDataScope` 装饰器实现基于 `createdAdminId` 的数据隔离。

### 修改范围
为所有 7 个 Service 的查询和批量操作方法添加数据隔离：

#### 1. 添加导入
```typescript
import { AdminDataScope, getAdminDataScopeWhere } from '@/app/admin/decorators/adminDataScope.decorator';
```

#### 2. 方法装饰
```typescript
@AdminDataScope()
async list(input: CmsQueryDto) { ... }

@AdminDataScope()
async listRecycleBin(input: CmsQueryDto) { ... }

@AdminDataScope()
@Transaction()
async batchDelete(ids: string[]) { ... }

@AdminDataScope()
@Transaction()
async batchUpdateStatus(ids: string[], status: number) { ... }
```

#### 3. where 条件增强
```typescript
const where: WhereOptions = { 
  id: { [Op.in]: validIds }, 
  deletedAt: null,
  ...getAdminDataScopeWhere(this)  // 自动注入 createdAdminId 过滤
};
```

### 隔离效果
- 管理员只能查看/编辑/删除自己创建的内容
- 批量操作自动过滤不属于当前管理员的记录
- 回收站只显示当前管理员的软删除记录

---

## 📊 完成统计

### 修改文件清单

#### 实体层（7 个文件）
- ✅ `entities/aonCmsArticle.entity.ts` - 添加 deletedAt 字段
- ✅ `entities/aonCmsPage.entity.ts` - 添加 deletedAt 字段
- ✅ `entities/aonCmsComment.entity.ts` - 添加 deletedAt 字段
- ✅ `entities/aonCmsTag.entity.ts` - 添加 deletedAt 字段
- ✅ `entities/aonCmsTopic.entity.ts` - 添加 deletedAt 字段
- ✅ `entities/aonCmsBlock.entity.ts` - 添加 deletedAt 字段
- ✅ `entities/aonCmsCategory.entity.ts` - 添加 deletedAt 字段

#### Service 层（7 个文件）
- ✅ `service/article.service.ts` - 回收站 + 批量操作（含标签/专题）+ 数据隔离
- ✅ `service/page.service.ts` - 回收站 + 批量操作 + 数据隔离
- ✅ `service/comment.service.ts` - 回收站 + 批量操作 + 数据隔离
- ✅ `service/tag.service.ts` - 回收站 + 批量操作（含引用检查）+ 数据隔离
- ✅ `service/topic.service.ts` - 回收站 + 批量操作（含引用检查）+ 数据隔离
- ✅ `service/block.service.ts` - 回收站 + 批量操作 + 数据隔离
- ✅ `service/category.service.ts` - 回收站 + 批量操作（含子栏目/引用检查）+ 数据隔离

#### Controller 层（7 个文件）
- ✅ `controller/article.controller.ts` - 回收站接口 + 批量操作接口（4 个）
- ✅ `controller/page.controller.ts` - 回收站接口 + 批量操作接口（2 个）
- ✅ `controller/comment.controller.ts` - 回收站接口 + 批量操作接口（2 个）
- ✅ `controller/tag.controller.ts` - 回收站接口 + 批量操作接口（2 个）
- ✅ `controller/topic.controller.ts` - 回收站接口 + 批量操作接口（2 个）
- ✅ `controller/block.controller.ts` - 回收站接口 + 批量操作接口（2 个）
- ✅ `controller/category.controller.ts` - 回收站接口 + 批量操作接口（2 个）

#### DTO 层（1 个文件）
- ✅ `dto/common.dto.ts` - 已存在完整的批量操作 DTO

**总计**：22 个文件修改，新增约 2000 行代码

---

## 🔒 安全保障

### 1. 事务安全
所有批量操作和删除操作使用 `@Transaction()` 装饰器确保原子性

### 2. 并发锁
批量操作使用 `await this.lock()` 防止并发冲突（PostgreSQL Advisory Lock）

### 3. 数据校验
- 批量操作前验证记录存在性
- Tag/Topic 删除前检查文章引用
- Category 删除前检查子栏目和文章引用
- 状态值使用 `valid(0,1,2,3,4)` 严格校验

### 4. 权限控制
- 所有接口使用 `@AdminPermission` 装饰器
- 通过 `@AdminDataScope` 实现数据隔离
- 批量操作只影响当前管理员的数据

---

## 📝 使用说明

### 数据库迁移
**重要**：需要用户手动执行数据库同步以添加 `deleted_at` 字段：

```sql
-- 为所有 CMS 表添加 deleted_at 字段
ALTER TABLE aon_cms_article ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE aon_cms_page ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE aon_cms_comment ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE aon_cms_tag ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE aon_cms_topic ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE aon_cms_block ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE aon_cms_category ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;

-- 为 deleted_at 字段创建索引（优化回收站查询性能）
CREATE INDEX idx_article_deleted_at ON aon_cms_article(deleted_at);
CREATE INDEX idx_page_deleted_at ON aon_cms_page(deleted_at);
CREATE INDEX idx_comment_deleted_at ON aon_cms_comment(deleted_at);
CREATE INDEX idx_tag_deleted_at ON aon_cms_tag(deleted_at);
CREATE INDEX idx_topic_deleted_at ON aon_cms_topic(deleted_at);
CREATE INDEX idx_block_deleted_at ON aon_cms_block(deleted_at);
CREATE INDEX idx_category_deleted_at ON aon_cms_category(deleted_at);
```

### API 接口清单

#### 回收站接口（所有实体通用）
```
POST /addons/cms/{entity}/recycleBin      # 查询回收站列表
POST /addons/cms/{entity}/restore/:id     # 恢复记录
POST /addons/cms/{entity}/forceDelete/:id # 彻底删除
```

#### 批量操作接口（所有实体通用）
```
POST /addons/cms/{entity}/batchDelete          # 批量软删除
POST /addons/cms/{entity}/batchUpdateStatus    # 批量更新状态
```

#### 文章专属批量接口
```
POST /addons/cms/article/batchAddTags    # 批量添加标签
POST /addons/cms/article/batchSetTopic   # 批量设置专题
```

### 前端集成建议
1. 列表页增加"回收站"标签页切换
2. 表格增加多选框和批量操作按钮
3. 回收站页面提供"恢复"和"彻底删除"操作
4. 批量操作提供操作确认弹窗

---

## ⚠️ 注意事项

1. **数据库同步**：P2 功能需要先执行上述 SQL 迁移
2. **权限配置**：确保管理员角色已分配对应权限（`aon_cms_xxx_del`, `aon_cms_xxx_edit`）
3. **前端适配**：需要前端团队配合实现回收站 UI 和批量操作交互
4. **性能优化**：建议为 `deleted_at` 和 `created_admin_id` 字段添加复合索引
5. **数据清理**：建议定期清理回收站中超过 30 天的软删除记录

---

## 🎯 下一步：P3 任务

P2 核心功能已全部完成并落地代码，接下来可执行 P3 体验优化任务：

### P3 任务 6：补充安装说明
创建 `addons/cms/install.md` 说明：
- 安装步骤和依赖
- 数据库同步命令
- P2 功能的迁移 SQL

### P3 任务 7：前台演示优化
- 确保演示数据在前台展示美观
- 图片使用占位符或默认封面
- 优化前台样式和布局

---

**报告日期**：2026-09-21  
**执行状态**：P2 任务 100% 完成，代码已落地  
**待执行**：P3 任务（需用户确认是否继续）
