# Meadmin 文档插件（doc）

面向 Meadmin 生态的 Markdown 文档中心插件。后台按版本维护树形文档目录，前台提供多版本文档浏览、目录定位与外链菜单，适合产品手册、开发文档和帮助中心。

## 功能特性

### 前台文档中心

- 文档路由：`/aon/doc`，默认自动打开当前启用版本的第一篇 Markdown 文档
- 多版本浏览：按版本切换文档，默认使用配置中启用的版本
- 树形目录：目录与文档分级展示，支持无限层级
- Markdown 渲染：标题、表格、代码块、图片、链接等标准语法
- 代码高亮、KaTeX 公式、Mermaid 流程图
- 右侧文章目录（Catalog），随滚动定位当前章节
- 外链菜单：`contentType=1` 的节点直接跳转外部地址
- 移动端适配：窄屏隐藏右侧目录，正文全宽显示
- 独立预览入口：前台只加载展示所需依赖，不加载编辑器与图片裁剪

### 后台文档管理

- 文档树管理：新增、编辑、删除、详情、树形展开
- 内容类型：Markdown 内容 / 外部链接
- Markdown 编辑器：工具栏、代码块、表格、图片上传
- 图标设置：为目录或文档配置图标
- 版本管理：按版本筛选文档；跨版本一键复制文档
- 排序与状态：`orderNum` 降序排序，启用 / 禁用控制前台可见性
- 权限控制：列表、详情、新增、编辑、删除、复制、配置分别授权

### 站点配置

- 站点图标
- 版本列表：标题、标识（code）、启用状态
- 相关外链：图标、标题、地址（如 GitHub、交流群）

## 目录结构

```
addons/doc
├─ addons.json              # 插件元信息与安装/卸载脚本
├─ install.sql              # 建表、初始化配置、后台菜单与权限
├─ uninstall.sql            # 卸载时清理表与菜单
├─ src/                     # 文档渲染包（md-editor-v3 封装）
│  ├─ index.ts              # 编辑器 + 预览总入口
│  ├─ preview.ts            # 前台精简预览入口
│  └─ style.ts              # 编辑器样式入口
├─ template/                # 安装到主项目的模板文件
│  ├─ src/app/admin/...     # 后台接口：文档、配置
│  ├─ src/app/index/...     # 前台接口：菜单树、内容、配置
│  ├─ src/entities/...      # aon_doc、aon_doc_config 实体
│  └─ view/...              # 后台管理页与前台文档页
└─ dist/                    # 构建后的渲染包
```

## 数据表

| 表名 | 说明 |
|------|------|
| `aon_doc` | 文档表：树形结构、版本、类型、状态、排序、Markdown 内容、外链 |
| `aon_doc_config` | 配置表：站点图标、版本列表、外链列表（JSON） |

## 环境要求

- Node.js >= 22.14.0
- pnpm
- Midway 3 + Sequelize 7 + PostgreSQL
- Vue 3 + Element Plus

## 安装

在 Meadmin 项目根目录执行：

```bash
npx meadmin addon doc
```

安装过程会：

1. 复制插件后端、实体与前端页面到主项目
2. 安装 `meadmin-addons-doc` 工作区依赖并构建
3. 执行 `install.sql` 创建数据表、初始化配置、写入后台菜单与权限

安装完成后，在后台「系统 → 角色管理」为角色勾选文档相关权限。

卸载：

```bash
npx meadmin addon doc --rm
```

将删除插件文件、执行 `uninstall.sql` 清理数据表与菜单，并移除工作区依赖。

## 后台菜单与权限

| 菜单 | 权限标识 |
|------|----------|
| 文档管理 | `aon_doc_list`、`aon_doc_info`、`aon_doc_add`、`aon_doc_edit`、`aon_doc_del`、`aon_doc_copy` |
| 文档配置 | `aon_doc_config_info`、`aon_doc_config_edit` |

## 路由与接口

### 前台路由

| 路由 | 说明 |
|------|------|
| `/aon/doc` | 文档入口，自动跳转首篇文档 |
| `/aon/doc/index` | 默认版本首页 |
| `/aon/doc/:version/:labelOrId` | 指定版本与文档 |

### 前台接口（前缀 `/api/index`）

| 方法 | 地址 | 说明 |
|------|------|------|
| GET | `/aonDoc/menuTree?version=` | 文档菜单树 |
| GET | `/aonDoc/getContent/:version/:labelOrId` | 文档内容 |
| GET | `/aonDoc/config` | 站点配置 |

### 后台接口（前缀 `/api/admin`）

| 方法 | 地址 | 说明 |
|------|------|------|
| GET | `/addons/doc/doc/treeAll?version=` | 全部文档树 |
| POST | `/addons/doc/doc/` | 文档列表 |
| GET | `/addons/doc/doc/info/:id` | 文档详情 |
| POST | `/addons/doc/doc/add` | 新增文档 |
| POST | `/addons/doc/doc/up/:id` | 更新文档 |
| POST | `/addons/doc/doc/del/:id` | 删除文档 |
| POST | `/addons/doc/doc/copy` | 跨版本复制文档 |
| GET | `/addons/doc/config/info` | 获取配置 |
| POST | `/addons/doc/config/up` | 更新配置 |

## 版本记录

- **1.0.0**：首个版本。支持多版本文档、树形目录、Markdown 渲染、代码高亮、公式与流程图、后台树形管理、跨版本复制、站点配置与外链。
