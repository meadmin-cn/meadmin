# Meadmin CMS 插件

基于 Midway 3 + TypeScript + Vue 3 的现代化内容管理系统（CMS）插件，实现完整的核心内容管理功能。

## 安装

遵循 meadmin 标准插件规范，**一条命令安装，演示数据随安装强制携带**：

```bash
npx meadmin addon cms
```

执行后自动完成：复制插件代码（`template/`）→ 执行 `installShells`（安装封面与示例下载资源）→ 执行 `install.sql`（建表 + 权限菜单 + 携带演示数据）。装完即可访问前台查看演示效果。

> 已安装过请加 `-f` 强制重装：`npx meadmin addon cms -f`
> 指定环境读取对应数据库配置：`npx meadmin -m local addon cms`

### 卸载

```bash
npx meadmin addon cms --rm
```

自动删除插件代码目录、清理静态资源、执行 `uninstall.sql` 删除全部 CMS 表与菜单（演示数据随之清除）。

## 功能清单

| 模块 | 说明 |
|------|------|
| 栏目管理 | 嵌套集无限级栏目，6 种类型（文章列表 / 目录 / 外链 / 自定义表单 / 单页 / 下载列表），前台头部菜单完全由栏目驱动 |
| 文章管理 | 增删改查 + 状态流转（草稿 → 待审核 → 发布/拒绝/下线）+ 定时发布 + SEO + 标签/专题关联 + 下载资源绑定 |
| 单页管理 | 增删改查 + 审核流程 + SEO |
| 标签管理 | 增删改查 + SEO 标识 + 排序 |
| 专题管理 | 增删改查 + 文章关联 |
| 区块管理 | 增删改查 + 首页轮播/推荐位 + 有效期控制 |
| 评论管理 | 多级评论树 + 审核 + 举报 |
| 统计 | 各模块计数 + 待审核/发布/定时统计 + 趋势 |
| 订单 | 线下订单 + 状态流转（收款 / 发货 / 完成 / 关闭） |
| 自定义表单 | 动态表单定义 + 提交数据管理（含留言板） |

### 技术特性

- 后端：Midway 3 + TypeScript + `@sequelize/core` + PostgreSQL
- 前端：Vue 3 + TypeScript + Element Plus
- 权限：`AdminPermission` 装饰器
- 编辑器：wangEditor 富文本，正文以 HTML 存储并经 `DOMPurify` 消毒展示
- 数据表：14 张 `aon_cms_*` 表

## 权限菜单

`install.sql` 不自动分配角色权限，装完需在后台为角色勾选（父菜单 `addons_cms`）：

| 菜单 | 规则前缀 | 按钮权限 |
|------|---------|---------|
| 栏目 | `aon_cms_category` | list / info / add / edit / del |
| 标签 | `aon_cms_tag` | list / info / add / edit / del |
| 专题 | `aon_cms_topic` | list / info / add / edit / del |
| 文章 | `aon_cms_article` | list / info / add / edit / del / review |
| 单页 | `aon_cms_page` | list / info / add / edit / del / review |
| 区块 | `aon_cms_block` | list / info / add / edit / del |
| 评论 | `aon_cms_comment` | list / info / add / edit / del / review |
| 统计 | `aon_cms_statistics` | list |
| 订单 | `aon_cms_order` | list / info / edit / pay / ship / follow / complete / close / del |
| 自定义表单 | `aon_cms_diyform` | list / info / add / edit / del |
| 表单数据 | `aon_cms_diyform_data` | list / info / edit / review / reply / export / del |

其中「表单数据」为隐藏菜单（从「自定义表单」列表的「查看数据」进入），用于管理留言板等表单的提交数据。

## 演示数据

安装时自动携带：

| 类型 | 数量 | 说明 |
|------|------|------|
| 栏目 | 13 | 产品动态 / 帮助中心 / 解决方案（含子栏目）、开发素材、下载中心、留言板、关于我们 |
| 标签 | 8 | AI / 云原生 / 低代码 / 权限 / 可视化 / 性能 / 模板 / 安全 |
| 专题 | 3 | 从零搭建后台 / 性能优化实战 / 插件生态 |
| 单页 | 3 | 关于我们 / 服务协议 / 隐私政策 |
| 自定义表单 | 3 | 含留言板（前台 `/aon/cms/form/*`） |
| 区块 | 13 | 首页轮播与推荐位 |
| 文章 | 32 | `demo-` 前缀，覆盖草稿 / 待审核 / 发布 / 拒绝 / 下线 / 定时发布等全部状态 |
| 评论 | 270 | 多级评论树，已校准计数 |
| 下载资源 | 17 篇 | 绑定 `/files/*.csv|txt` 示例文件，随安装自动放置 |

封面与下载资源均为站内静态资源（`/index/images/cms/*`、`/files/*`），无需外网，由 `install-assets.mjs` 安装、`uninstall-assets.mjs` 清理。

## 依赖

- `dompurify` - HTML 消毒（正文展示）

富文本编辑器复用宿主项目的 wangEditor 组件（`@wangeditor/editor`），由 meadmin 宿主提供，CMS 插件无需自带。

后端基于 meadmin 核心框架（Midway 3 + `@sequelize/core` + `@sequelize/postgres`），无需额外安装。

## 配置

数据库连接在 `src/config/database.ts` 中配置，注意 `install.sql` 默认 `search_path` 为 `meadmin`，需与数据库 schema 一致。

## 常见问题

**数据库连接失败**：检查 PostgreSQL 服务是否启动、`.env` 中数据库配置是否正确。

**权限不足（403）**：确认已为当前角色勾选 CMS 菜单权限。

**表不存在 / 字段缺失**：确认已执行 `install.sql`（`npx meadmin addon cms` 会自动执行），并核对 `search_path` 与实际 schema 一致。

**前台图片/下载 404**：确认已执行 `install-assets.mjs`，且 `public/index/images/cms/` 与 `public/files/` 下存在对应资源。

## 技术支持

如有问题或建议，请提交 Issue 或 PR 到 meadmin 项目仓库。
