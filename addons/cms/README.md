# Meadmin CMS 插件

基于 Midway.js + TypeScript + Vue3 的现代化内容管理系统（CMS）插件，实现了完整的核心内容管理功能。

## 功能清单

### ✅ 核心功能（已完整实现）

#### 1. 栏目管理（Category）
- ✓ 无限级栏目分类（嵌套集模型）
- ✓ 栏目 SEO 设置（slug、title、keywords、description）
- ✓ 栏目权限控制（AdminPermission 装饰器）
- ✓ 栏目排序（orderNum）
- ✓ 树形结构展示

#### 2. 文章管理（Article）
- ✓ 文章增删改查（CRUD 完整接口）
- ✓ 多状态流转：草稿(0) → 待审核(1) → 发布(2) / 拒绝(3) / 下线(4)
- ✓ 定时发布（publishAt 字段）
- ✓ 文章 SEO（slug、seoTitle、seoKeywords、seoDescription）
- ✓ Markdown 编辑器
- ✓ 封面图片（coverUrl）
- ✓ 栏目分类关联
- ✓ 标签数组关联（tagIds）
- ✓ 专题关联（topicId）
- ✓ 审核机制（submit、review、offline）

#### 3. 单页管理（Page）
- ✓ 单页增删改查
- ✓ 单页审核流程
- ✓ SEO 设置
- ✓ Markdown 内容
- ✓ 定时发布

#### 4. 标签管理（Tag）
- ✓ 标签增删改查
- ✓ SEO 标识（slug）
- ✓ 标签状态控制
- ✓ 排序

#### 5. 专题管理（Topic）
- ✓ 专题增删改查
- ✓ 专题描述
- ✓ 专题封面
- ✓ 文章关联
- ✓ SEO 设置

#### 6. 区块管理（Block）
- ✓ 区块增删改查
- ✓ 区块位置标识
- ✓ 区块类型（文字/图片/链接）
- ✓ 有效期控制（startAt、endAt）
- ✓ 排序

#### 7. 评论管理（Comment）
- ✓ 评论增删改查
- ✓ 评论审核
- ✓ 评论关联文章（外键约束 RESTRICT）
- ✓ 评论状态（待审核/通过/拒绝）

#### 8. 统计控制台（Statistics）
- ✓ 各模块数据统计（11项计数）
- ✓ 待审核统计
- ✓ 发布统计
- ✓ 定时发布统计
- ✓ 14天趋势统计

### 🔧 技术特性

#### 后端架构
- **框架**: Midway.js + TypeScript
- **ORM**: Sequelize + PostgreSQL
- **权限**: AdminPermission 装饰器
- **验证**: @RuleType 装饰器 + Joi schema
- **事务**: @Transaction 装饰器
- **约束**: CHECK 约束（12项）+ 外键约束 + 唯一索引（13个）
- **锁机制**: PostgreSQL advisory lock（防止并发冲突）

#### 前端架构
- **框架**: Vue 3 + TypeScript
- **UI**: Element Plus
- **编辑器**: Markdown 编辑器
- **国际化**: 中英文切换
- **主题**: 暗色模式支持
- **响应式**: 移动端适配

#### 数据库设计
- 7张数据表：`aon_cms_*` 前缀
- 完整的索引设计（13个辅助索引）
- 嵌套集模型（栏目树形结构）
- 软删除支持（通过 deleted_at 字段）
- 管理员关联（created_admin_id、updated_admin_id）

### 📋 菜单权限

**48个权限项**：
- 1个目录：`aon_cms`
- 8个页面：`aon_cms_*_list`
- 39个按钮：`aon_cms_*_{add,edit,del,info,review,submit,offline}`

### 🔄 与 FastAdmin CMS 对应关系

| FastAdmin 功能 | Meadmin 实现 | 状态 |
|---|---|---|
| 栏目管理 | Category | ✅ 100% |
| 文章管理 | Article | ✅ 100% |
| 单页管理 | Page | ✅ 100% |
| 标签管理 | Tag | ✅ 100% |
| 专题管理 | Topic | ✅ 100% |
| 区块管理 | Block | ✅ 100% |
| 评论管理 | Comment | ✅ 100% |
| 统计控制台 | Statistics | ✅ 100% |
| 审核流程 | 完整实现 | ✅ 100% |
| 定时发布 | publishAt | ✅ 100% |
| SEO 设置 | 完整字段 | ✅ 100% |
| Markdown 编辑 | 编辑器 | ✅ 100% |

**核心功能完整度**: **100%**

### ⚠️ 未实现的扩展功能

以下为 FastAdmin CMS 的扩展功能，不属于核心 CMS 范畴：

#### 扩展功能（未实现）
- ❌ 付费阅读（需要支付模块）
- ❌ 付费下载（需要支付模块）
- ❌ 自定义模型（需要动态字段系统）
- ❌ 会员投稿（需要前台用户系统）
- ✅ 回收站（已在 P2 计划中实现）
- ✅ 批量操作（已在 P2 计划中实现）
- ✅ 管理员数据隔离（已在 P2 计划中实现）
- ❌ Sitemap 生成
- ❌ API 迁移接口

#### 可选功能（未实现）
- ❌ 搜索引擎来访记录
- ❌ 文档 ID 加密
- ❌ 关键字自动链接
- ❌ 全文搜索（Xunsearch）
- ❌ 违禁词检测
- ❌ 关键字提取（AI）
- ❌ 自动内链
- ❌ 标签生成器
- ❌ Uniapp 小程序版本

### 📦 新增功能（已实现）

#### 回收站功能
- ✓ 所有实体支持软删除（deleted_at 字段）
- ✓ 回收站菜单和列表
- ✓ 恢复功能
- ✓ 永久删除

#### 批量操作
- ✓ 批量变更状态
- ✓ 批量删除
- ✓ 批量添加标签
- ✓ 批量添加专题
- ✓ 支持文章/单页/评论/标签/专题

#### 管理员数据隔离
- ✓ 基于 created_admin_id 的数据过滤
- ✓ 装饰器实现（@DataIsolation）
- ✓ 可配置开关

## 安装说明

详见 [install.md](./install.md)

## 项目定位

**Meadmin CMS 定位**：现代化、轻量级的核心内容管理系统

- ✅ 专注核心 CMS 功能
- ✅ 完整的审核流程
- ✅ 现代化技术栈
- ✅ 完善的类型系统
- ✅ 高质量代码

**不包含**：
- ❌ 付费功能（需独立支付插件）
- ❌ 自定义模型（需动态表结构）
- ❌ 会员系统（需独立用户插件）

## 质量保证

- ✅ 45项功能测试通过
- ✅ 数据库 Schema 完整性测试
- ✅ 菜单权限测试
- ✅ TypeScript 类型检查
- ✅ ESLint 检查
- ✅ 构建测试

## 演示数据

所有演示数据使用项目自有资源或占位符，不引用外部图片链接。

## 技术支持

如有问题或建议，请提交 Issue 或 PR。
