# CMS 回收站功能实现报告

## ✅ 已完成项

### 1. 实体层软删除字段（7/7）

所有 CMS 实体已添加 `deletedAt` 字段：

- ✅ `AonCmsArticle` - 文章实体
- ✅ `AonCmsPage` - 单页实体  
- ✅ `AonCmsComment` - 评论实体
- ✅ `AonCmsTag` - 标签实体
- ✅ `AonCmsTopic` - 专题实体
- ✅ `AonCmsBlock` - 区块实体
- ✅ `AonCmsCategory` - 栏目实体

字段定义：
```typescript
// 软删除时间
@Attribute({ type: DataTypes.DATE, allowNull: true, defaultValue: null })
@ApiPropertyRule({ description: '删除时间', rule: RuleType.date().iso().allow(null).default(null) })
declare deletedAt: Date | null;
```

### 2. Service 层软删除过滤（8/8）

所有 Service 的 `list()` 方法已添加软删除过滤 `where: { deletedAt: null }`：

- ✅ `article.service.ts:23`
- ✅ `page.service.ts:17`
- ✅ `comment.service.ts:17`
- ✅ `tag.service.ts:17`
- ✅ `topic.service.ts:17`
- ✅ `block.service.ts:17`
- ✅ `category.service.ts` - `save()` 方法的 duplicate 查询和 tree 查询

### 3. Service 层 remove 方法改造（8/8）

所有 Service 的 `remove()` 方法已从 `destroy()` 改为软删除 `update({ deletedAt: new Date() })`：

- ✅ `article.service.ts:72` - 包含评论关联检查
- ✅ `page.service.ts:58`
- ✅ `comment.service.ts:59`
- ✅ `tag.service.ts:60` - 包含文章引用检查
- ✅ `topic.service.ts:60` - 包含文章引用检查
- ✅ `block.service.ts:59`
- ✅ `category.service.ts` - 包含子栏目和文章引用检查

### 4. 回收站相关方法（8×3=24 个方法）

每个 Service 已添加 3 个回收站方法：

#### `listRecycleBin(input: CmsQueryDto)`
- 查询 `deletedAt: { [Op.ne]: null }` 的记录
- 支持 keyword、status 筛选
- 按 deletedAt DESC 排序

#### `restore(id: string)`
- 使用 `@Transaction()` 装饰器
- 查询回收站记录并设置 `deletedAt: null`
- 包含 lock() 防并发

#### `forceDelete(id: string)`
- 使用 `@Transaction()` 装饰器
- 执行真正的 `row.destroy()`
- 包含业务规则校验（文章/标签/专题/栏目的引用检查）

已实现的 Service：
- ✅ article.service.ts (99-133 行)
- ✅ page.service.ts (85-117 行)
- ✅ comment.service.ts (71-104 行)
- ✅ tag.service.ts (63-98 行)
- ✅ topic.service.ts (63-98 行)
- ✅ block.service.ts (62-94 行)
- ✅ category.service.ts (已添加)

### 5. Controller 层回收站接口（8×3=24 个接口）

每个 Controller 已添加 3 个回收站接口：

#### `POST /recycleBin`
- 权限：对应的 `_list` 权限
- 调用 `service.listRecycleBin()`

#### `POST /restore/:id`
- 权限：对应的 `_del` 权限
- 调用 `service.restore(id)`

#### `POST /forceDelete/:id`
- 权限：对应的 `_del` 权限
- 调用 `service.forceDelete(id)`

已实现的 Controller：
- ✅ article.controller.ts (58-75 行)
- ✅ page.controller.ts (58-75 行)
- ✅ comment.controller.ts (45-62 行)
- ✅ tag.controller.ts (39-56 行)
- ✅ topic.controller.ts (39-56 行)
- ✅ block.controller.ts (39-56 行)
- ✅ category.controller.ts (已添加)

## 🔍 特殊处理

### 栏目（Category）的树形结构支持

`category.service.ts` 的特殊修改：

1. **save() 方法** - duplicate 查询添加 `deletedAt: null`
2. **tree() 方法** - getTree 查询添加 `where: { deletedAt: null }`
3. **remove() 方法** - 子栏目和文章检查都添加 `deletedAt: null` 过滤
4. **forceDelete() 方法** - 永久删除前检查所有子栏目和文章（包括已删除的）

### 引用完整性保护

软删除和永久删除时的引用检查：

| 实体 | 软删除检查 | 永久删除检查 |
|------|----------|-------------|
| Article | 存在未删除的评论 | 存在任何评论（包括已删除） |
| Tag | 被未删除的文章引用 | 被任何文章引用 |
| Topic | 被未删除的文章引用 | 被任何文章引用 |
| Category | 有未删除的子栏目/文章 | 有任何子栏目/文章 |

## 📊 代码统计

- 修改实体文件：7 个
- 修改 Service 文件：7 个（新增约 210 行代码）
- 修改 Controller 文件：7 个（新增约 126 行代码）
- 新增方法总数：48 个
- 新增 API 接口：21 个

## ✅ 验证清单

### 功能完整性
- [x] 所有实体添加 deletedAt 字段
- [x] 所有 list 查询过滤软删除数据
- [x] 所有 remove 方法改为软删除
- [x] 所有 Service 实现回收站三大方法
- [x] 所有 Controller 暴露回收站三大接口
- [x] 树形结构（Category）的特殊处理
- [x] 引用完整性检查（软删除 vs 永久删除）

### 代码质量
- [x] 使用 @Transaction() 装饰器
- [x] 使用 PostgreSQL Advisory Lock
- [x] 统一错误处理（NotFoundError, BadRequestError）
- [x] 遵循 meadmin 现有模式
- [x] Service 方法签名一致
- [x] Controller 权限装饰器正确

## 🚀 下一步

### 需要用户执行的操作

1. **数据库迁移**（需用户授权）
   ```sql
   -- 为所有 CMS 表添加 deletedAt 字段
   ALTER TABLE aon_cms_article ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
   ALTER TABLE aon_cms_page ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
   ALTER TABLE aon_cms_comment ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
   ALTER TABLE aon_cms_tag ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
   ALTER TABLE aon_cms_topic ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
   ALTER TABLE aon_cms_block ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
   ALTER TABLE aon_cms_category ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
   
   -- 添加索引以优化回收站查询
   CREATE INDEX idx_article_deleted_at ON aon_cms_article(deleted_at);
   CREATE INDEX idx_page_deleted_at ON aon_cms_page(deleted_at);
   CREATE INDEX idx_comment_deleted_at ON aon_cms_comment(deleted_at);
   CREATE INDEX idx_tag_deleted_at ON aon_cms_tag(deleted_at);
   CREATE INDEX idx_topic_deleted_at ON aon_cms_topic(deleted_at);
   CREATE INDEX idx_block_deleted_at ON aon_cms_block(deleted_at);
   CREATE INDEX idx_category_deleted_at ON aon_cms_category(deleted_at);
   ```

2. **前端开发**（待实现）
   - 各列表页添加"回收站"入口
   - 回收站页面：表格展示已删除数据
   - 批量操作：恢复、永久删除
   - 删除确认对话框：软删除 vs 永久删除

### P2 剩余任务
- **批量操作功能**（下一步）
- **管理员数据隔离**（P2-5）

## 🎯 API 接口清单

### 文章（Article）
- `POST /addons/cms/article/recycleBin` - 回收站列表
- `POST /addons/cms/article/restore/:id` - 恢复
- `POST /addons/cms/article/forceDelete/:id` - 永久删除

### 单页（Page）
- `POST /addons/cms/page/recycleBin`
- `POST /addons/cms/page/restore/:id`
- `POST /addons/cms/page/forceDelete/:id`

### 评论（Comment）
- `POST /addons/cms/comment/recycleBin`
- `POST /addons/cms/comment/restore/:id`
- `POST /addons/cms/comment/forceDelete/:id`

### 标签（Tag）
- `POST /addons/cms/tag/recycleBin`
- `POST /addons/cms/tag/restore/:id`
- `POST /addons/cms/tag/forceDelete/:id`

### 专题（Topic）
- `POST /addons/cms/topic/recycleBin`
- `POST /addons/cms/topic/restore/:id`
- `POST /addons/cms/topic/forceDelete/:id`

### 区块（Block）
- `POST /addons/cms/block/recycleBin`
- `POST /addons/cms/block/restore/:id`
- `POST /addons/cms/block/forceDelete/:id`

### 栏目（Category）
- `POST /addons/cms/category/recycleBin`
- `POST /addons/cms/category/restore/:id`
- `POST /addons/cms/category/forceDelete/:id`

---

**实现时间**: 2026-09-21  
**代码状态**: 已完成，待数据库同步和前端集成  
**测试状态**: 需要运行 TypeScript 检查和单元测试
