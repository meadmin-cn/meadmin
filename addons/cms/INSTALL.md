# CMS 插件安装说明

## 📦 插件信息

- **插件名称**：CMS 内容管理系统
- **插件标识**：aon-cms
- **版本要求**：meadmin v2.0+
- **数据库**：PostgreSQL 12+
- **Node.js**：16+

---

## 🚀 快速安装

### 1. 安装插件

```bash
# 进入 meadmin 项目根目录
cd /path/to/meadmin

# 安装 CMS 插件（假设插件已在 addons 目录）
# 插件文件应位于 addons/cms/ 目录下
```

### 2. 数据库迁移

执行 SQL 脚本初始化数据库表和字段：

```bash
# 方式 1：使用 psql 命令行
psql -U your_username -d your_database -f addons/cms/migrations/add_soft_delete.sql

# 方式 2：使用数据库客户端
# 打开 addons/cms/migrations/add_soft_delete.sql
# 在 Navicat/DBeaver/pgAdmin 等工具中执行
```

**重要**：该脚本包含以下操作：
- 为所有 CMS 表添加 `deleted_at` 字段（软删除功能）
- 创建索引优化查询性能
- 创建复合索引支持管理员数据隔离

### 3. 配置权限

CMS 插件包含 48 个权限项，需要在管理后台为角色分配权限：

#### 核心权限分类

**文章管理（aon_cms_article_*）**
- `aon_cms_article_list` - 文章列表
- `aon_cms_article_info` - 文章详情
- `aon_cms_article_add` - 新增文章
- `aon_cms_article_edit` - 编辑文章
- `aon_cms_article_del` - 删除文章
- `aon_cms_article_review` - 审核文章

**单页管理（aon_cms_page_*）**
- `aon_cms_page_list` - 单页列表
- `aon_cms_page_info` - 单页详情
- `aon_cms_page_add` - 新增单页
- `aon_cms_page_edit` - 编辑单页
- `aon_cms_page_del` - 删除单页
- `aon_cms_page_review` - 审核单页

**评论管理（aon_cms_comment_*）**
- `aon_cms_comment_list` - 评论列表
- `aon_cms_comment_info` - 评论详情
- `aon_cms_comment_add` - 新增评论
- `aon_cms_comment_edit` - 编辑评论
- `aon_cms_comment_del` - 删除评论
- `aon_cms_comment_review` - 审核评论

**栏目管理（aon_cms_category_*）**
- `aon_cms_category_list` - 栏目列表
- `aon_cms_category_info` - 栏目详情
- `aon_cms_category_add` - 新增栏目
- `aon_cms_category_edit` - 编辑栏目
- `aon_cms_category_del` - 删除栏目

**标签管理（aon_cms_tag_*）**
- `aon_cms_tag_list` - 标签列表
- `aon_cms_tag_info` - 标签详情
- `aon_cms_tag_add` - 新增标签
- `aon_cms_tag_edit` - 编辑标签
- `aon_cms_tag_del` - 删除标签

**专题管理（aon_cms_topic_*）**
- `aon_cms_topic_list` - 专题列表
- `aon_cms_topic_info` - 专题详情
- `aon_cms_topic_add` - 新增专题
- `aon_cms_topic_edit` - 编辑专题
- `aon_cms_topic_del` - 删除专题

**区块管理（aon_cms_block_*）**
- `aon_cms_block_list` - 区块列表
- `aon_cms_block_info` - 区块详情
- `aon_cms_block_add` - 新增区块
- `aon_cms_block_edit` - 编辑区块
- `aon_cms_block_del` - 删除区块

**配置管理（aon_cms_config_*）**
- `aon_cms_config_list` - 配置列表
- `aon_cms_config_info` - 配置详情
- `aon_cms_config_edit` - 编辑配置

### 4. 重启服务

```bash
# 开发环境
npm run dev

# 生产环境
npm run stop
npm run start
```

---

## 🎯 功能验证

### 1. 访问后台管理

登录管理后台后，应该能看到以下菜单：

```
CMS 内容管理
├── 文章管理
├── 单页管理
├── 栏目管理
├── 标签管理
├── 专题管理
├── 评论管理
├── 区块管理
└── 配置管理
```

### 2. 测试核心功能

#### 文章管理流程
```
1. 创建栏目：内容管理 > 栏目管理 > 新增
2. 创建标签：内容管理 > 标签管理 > 新增
3. 创建专题：内容管理 > 专题管理 > 新增
4. 发布文章：内容管理 > 文章管理 > 新增
   - 选择栏目
   - 添加标签
   - 关联专题
   - 提交审核
5. 审核文章：文章列表 > 操作 > 审核通过
```

#### 回收站功能（P2 新增）
```
1. 软删除：列表页 > 操作 > 删除（记录移入回收站）
2. 查看回收站：切换到"回收站"标签页
3. 恢复记录：回收站 > 操作 > 恢复
4. 彻底删除：回收站 > 操作 > 彻底删除
```

#### 批量操作功能（P2 新增）
```
1. 多选记录：列表页勾选多条记录
2. 批量删除：点击"批量删除"按钮
3. 批量更新状态：选择状态 > 点击"批量更新"
4. 批量添加标签（文章）：选择标签 > 点击"批量添加"
5. 批量设置专题（文章）：选择专题 > 点击"批量设置"
```

### 3. API 接口测试

使用 Postman 或 curl 测试接口：

```bash
# 获取文章列表
curl -X POST http://localhost:7001/admin/addons/cms/article \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"page":1,"pageSize":20}'

# 查看回收站
curl -X POST http://localhost:7001/admin/addons/cms/article/recycleBin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"page":1,"pageSize":20}'

# 批量删除文章
curl -X POST http://localhost:7001/admin/addons/cms/article/batchDelete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"ids":["1","2","3"]}'

# 批量更新状态
curl -X POST http://localhost:7001/admin/addons/cms/article/batchUpdateStatus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"ids":["1","2","3"],"status":1}'
```

---

## 📋 依赖说明

### 核心依赖

CMS 插件依赖 meadmin 核心框架的以下模块：

- **@midwayjs/core** - MidwayJS 核心框架
- **@midwayjs/validate** - 数据验证
- **sequelize** - ORM 数据库操作
- **sequelize-typescript** - TypeScript 装饰器支持
- **pg** - PostgreSQL 驱动

### 可选依赖

如需启用高级功能，可安装以下依赖：

```bash
# Redis 缓存（提升查询性能）
npm install ioredis

# 搜索引擎（全文检索）
npm install @elastic/elasticsearch

# 图片处理（缩略图生成）
npm install sharp
```

---

## ⚙️ 配置说明

### 数据库配置

确保 `config/config.default.ts` 中配置了正确的数据库连接：

```typescript
export default {
  sequelize: {
    dataSource: {
      default: {
        dialect: 'postgres',
        host: '127.0.0.1',
        port: 5432,
        username: 'your_username',
        password: 'your_password',
        database: 'meadmin',
        define: {
          freezeTableName: true,
          underscored: true,
        },
      },
    },
  },
};
```

### CMS 专属配置

可在管理后台 "CMS 配置管理" 中设置：

- 文章默认封面
- 评论审核开关
- 允许的图片格式
- 上传文件大小限制
- SEO 相关配置

---

## 🔧 开发模式

### 启用热重载

```bash
npm run dev
```

### 调试模式

```typescript
// src/app/admin/addons/cms/service/article.service.ts
export class AonCmsArticleService {
  async list(input: CmsQueryDto) {
    // 添加调试日志
    this.logger.debug('查询参数:', input);
    // ... 业务逻辑
  }
}
```

### 单元测试

```bash
# 运行所有测试
npm test

# 运行 CMS 相关测试
npm test -- --grep "CMS"

# 生成覆盖率报告
npm run test:cov
```

---

## 🐛 常见问题

### 1. 数据库连接失败

**问题**：启动时报错 `ECONNREFUSED` 或 `password authentication failed`

**解决**：
1. 检查 PostgreSQL 服务是否启动
2. 确认数据库配置信息正确
3. 检查防火墙是否阻止连接

### 2. 权限不足

**问题**：访问 CMS 接口返回 403 Forbidden

**解决**：
1. 确认已为当前角色分配 CMS 权限
2. 检查 token 是否有效
3. 查看管理员日志确认权限配置

### 3. 软删除字段缺失

**问题**：启动时报错 `column "deleted_at" does not exist`

**解决**：
1. 检查是否执行了迁移脚本 `migrations/add_soft_delete.sql`
2. 确认数据库用户有 ALTER TABLE 权限
3. 手动执行迁移脚本

### 4. 批量操作无响应

**问题**：批量删除/更新时接口超时

**解决**：
1. 检查批量操作的记录数量（建议 ≤100）
2. 确认数据库索引已创建
3. 查看服务器日志定位问题

### 5. 管理员数据隔离失效

**问题**：管理员能看到其他管理员的数据

**解决**：
1. 确认 Service 方法已添加 `@AdminDataScope()` 装饰器
2. 检查 `created_admin_id` 字段是否正确填充
3. 查看中间件日志确认当前管理员 ID

---

## 📚 相关文档

- [README.md](./README.md) - 功能清单与技术说明
- [P2-COMPLETION-REPORT.md](./P2-COMPLETION-REPORT.md) - P2 功能完成报告
- [migrations/add_soft_delete.sql](./migrations/add_soft_delete.sql) - 数据库迁移脚本
- [AI-README.md](./AI-README.md) - AI 生成说明文档

---

## 🔄 升级指南

### 从旧版本升级

如果之前安装过不含软删除功能的版本：

1. 备份现有数据
```bash
pg_dump -U your_username -d your_database > cms_backup_$(date +%Y%m%d).sql
```

2. 执行迁移脚本
```bash
psql -U your_username -d your_database -f addons/cms/migrations/add_soft_delete.sql
```

3. 重启服务
```bash
npm run stop
npm run start
```

4. 验证功能
- 测试回收站功能
- 测试批量操作
- 检查管理员数据隔离

---

## 📞 技术支持

如遇到安装或使用问题，可通过以下方式获取帮助：

1. 查看 [README.md](./README.md) 中的功能说明
2. 查看 [P2-COMPLETION-REPORT.md](./P2-COMPLETION-REPORT.md) 中的 API 接口清单
3. 检查服务器日志 `logs/midway-app.log`
4. 提交 Issue 到 meadmin 项目仓库

---

**最后更新**：2026-09-21  
**文档版本**：v2.0（包含 P2 新功能）
