# Me-Admin

[![npm version](https://img.shields.io/npm/v/@meadmin/core)](https://www.npmjs.com/package/@meadmin/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22.14-blue)](https://nodejs.org/)
[![GitHub stars](https://img.shields.io/github/stars/meadmin-cn/meadmin?style=social)](https://github.com/meadmin-cn/meadmin/stargazers)

[English](README.md) | [简体中文](README_CN.md)

<p align="center">
  <img src="docs/assets/crud-demo.gif" alt="Me-Admin 一键 CRUD 演示" width="820" />
</p>

<p align="center">
  <img src="docs/assets/admin-dashboard.png" alt="Me-Admin 仪表盘" width="820" />
</p>
<p align="center">
  <img src="docs/assets/admin-list.png" alt="Me-Admin 一键 CRUD 列表" width="49%" />
  &nbsp;
  <img src="docs/assets/rbac-config.png" alt="Me-Admin 菜单权限（RBAC）" width="49%" />
</p>

**全栈一站式解决方案** —— Me-Admin 是一个免费开源的 Node.js + Vue 全栈中后台框架，后端基于 Midway.js 3，前端基于 Vue 3，一键 CRUD、SSR 渲染、权限体系开箱即用。MIT 协议，无加密、无授权限制，可商用。

- 🌐 官网：https://www.meadmin.cn
- 📖 文档：https://www.meadmin.cn/aon/doc/
- 💬 问题反馈：https://github.com/meadmin-cn/meadmin/issues

## 30 秒生成一个业务模块

定义好 Sequelize 实体之后，只需两条命令：

```bash
# 同步数据库结构
pnpm exec meadmin sync exampleDemo

# 一键生成：控制器、接口、前端页面、菜单权限
pnpm exec meadmin crud exampleDemo --menu
```

> meadmin 由 `@meadmin/cli` 提供命令行入口，统一通过 `pnpm exec meadmin <命令>` 调用。

刷新后台，菜单已经出现——列表、搜索、分页、增删改查、接口与菜单权限全部就位。生成的都是可读可改的源码，后续业务直接在上面写，没有黑盒。

## 主要特性

- **一键 CRUD**：命令行一键生成控制器、模型、视图与菜单权限，重复工作交给框架
- **SSR · CSR 混合渲染**：前台 SSR 提升 SEO 与首屏速度，后台 CSR 保证交互体验
- **内置权限系统**：RBAC 权限模型开箱即用，菜单、按钮、接口三级管控；支持无限父子级分组与自由授权，管理员可跨组别；动态路由权限方案，支持按钮级权限，前端菜单与接口动态获取两种模式
- **插件化架构**：功能以插件形式自由安装卸载，生态持续扩展，系统保持精简
- **全 TypeScript**：自动生成 TS 类型，前后端契约免维护
- **组件自动按需引入**：自动按需引入 components 下的组件定义，支持自定义引入位置和模式，真正的按需引入
- **友好的国际化**：前端支持按组件异步加载语言包
- **自定义 keepAlive**：可按 key 进行 vue keep-alive，解决不同路由统一组件不能独立刷新缓存的问题
- **可配置主题**：主题色与主题模式均可配置
- **集成 vxeTable**：功能最完善的 Vue 表格组件

## 技术栈

| 层 | 技术 |
|---|---|
| 计算层 | Vue 3 · Vite · TypeScript · Pinia · Element Plus · vue-request@next |
| 服务层 | Node.js · Midway.js 3.x · Sequelize 7 |
| 存储层 | PostgreSQL · Redis |

## 快速启动

### 依赖环境

- PostgreSQL 数据库
- Redis 缓存数据库
- Node.js >= 22.14.0
- pnpm

### 初始化项目

```bash
pnpm create meadminjs@latest
```

根据提示配置数据库等选项即可。

### 调试项目

```bash
pnpm dev
```

- 后台访问：http://127.0.0.1:7001/admin
- 前台访问：http://127.0.0.1:7001/

### 打包项目

```bash
pnpm build
```

### 默认账户

**后台**：账户 `admin` / 密码 `meAdmin#202507!P`
**前台**：账户 `test` / 密码 `123456789`

## 支持一下

如果 Me-Admin 帮你省了时间，欢迎点一个 ⭐ [Star](https://github.com/meadmin-cn/meadmin/stargazers)，遇到问题直接提 [Issue](https://github.com/meadmin-cn/meadmin/issues)，我都会回。

## 发布流程

面向框架维护者。一次发版包含两部分：**生成 `meadmin.sql` 与脚手架模板**、**发布 npm 包**。

### 发版前

- 准备好参考库对应的环境文件（如 `.env.local`），确认其中的 `DATABASE_SCHEMA` 就是导出使用的模式
- 确认工作区干净；提交信息遵循 Conventional Commits（`feat:` / `fix:` / `chore:`），CHANGELOG 由 release-it 生成

### 一键生成 SQL 与模板

在仓库根目录执行，用 `-m` 指定环境（`-m local` 会加载 `.env` + `.env.local`，后者覆盖前者）：

```bash
node packages/create-meadmin/bin/cli.js meadmin -m local
```

**第一步就会询问版本号**：直接回车保持当前版本，输入新版本则一次性写入 `packages/{core,midway-vite-view,cli,create-meadmin}` 与仓库根 `package.json`。只接受 `x.y.z` 稳定版本（这正是 `meadmin update` 的要求，提前卡住比发完才发现好）。非交互环境（CI、管道）不会阻塞，用 `--release-version 1.3.17` 指定。

之后按顺序完成，任一步失败即中止、不写半成品：

1. 读取数据库配置（`-m` 展开为 `.env` + `.env.<env>`，空值视为未配置）
2. 只读分析插件资产：`aon_` 前缀的表、`addons_` 根菜单及其后代、指向 `/aon/<插件>` 的站点绑定与伪静态
3. 生成干净的 `meadmin.sql`（剔除插件内容，并按 `parent_id` 重算菜单嵌套集）
4. 校验菜单树：左右边界唯一、子级均落在父级区间内
5. 生成完整备份（含插件表，仅用于回溯）
6. 导入临时 schema 校验表结构、行数与菜单关联，通过后清理
7. 写入文件，再生成模板

产物：

| 路径 | 内容 |
|---|---|
| `meadmin.sql` | 干净的核心数据，无 schema 前缀、无插件内容 |
| `.workbuddy/release/backup-<时间戳>.sql` | 全库备份 |
| `.workbuddy/release/meadmin-<时间戳>.prev.sql` | 上一份 `meadmin.sql` |
| `packages/create-meadmin/template/meadmin/` | 脚手架模板 |

常用参数：

| 参数 | 说明 |
|---|---|
| `-m, --mode <env>` | 按环境加载 `.env` + `.env.<env>`，如 `-m local` |
| `--release-version <x.y.z>` | 直接指定版本号，跳过交互询问 |
| `--env <file>` | 指定配置文件路径，优先于 `-m`；都不传时依次查找 `.env.local`、`.env` |
| `--schema <name>` | 覆盖 `DATABASE_SCHEMA` |
| `--only-template` | 跳过数据库导出，用现有 `meadmin.sql` 重新生成模板 |
| `--skip-template` | 只导出 SQL，不生成模板 |
| `--keep-addon <name...>` | 导出时保留指定插件的表与菜单数据 |
| `--skip-backup` / `--skip-verify` | 跳过备份 / 跳过导入校验（不建议） |
| `--dry-run` | 只导出并校验，不写文件 |

只改了前端或模板、数据库没有变动时，用 `--only-template` 即可。

### 构建与发布

```bash
pnpm -F @meadmin/core build
pnpm -F @meadmin/midway-vite-view build
pnpm -F @meadmin/cli build
pnpm -F create-meadminjs build
```

按依赖顺序发布，在各自包目录执行 `pnpm publish`（`@meadmin/*` 是 scoped 包，需带 `--access public`）：

| 顺序 | 包 |
|---|---|
| 1 | `packages/core` |
| 2 | `packages/midway-vite-view` |
| 3 | `packages/cli` |
| 4 | `packages/create-meadmin` |

`release-it` 只负责版本提交、tag、GitHub Release **和 CHANGELOG**，不发布 npm 包（`.release-it.json` 中 `npm.publish: false`）：

```bash
pnpm release
```

### 发布后验证

- 新建项目走一遍：`pnpm create meadminjs@latest`，确认初始化、`pnpm dev` 起得来
- 升级路径预演：用本地 verdaccio 发布预发版本，在测试项目执行 `pnpm exec meadmin update`，确认 `update.sql` 正常生成、表结构同步与「修复树关系」都通过

### 注意事项

- `meadmin.sql` 必须是干净的核心数据，插件表 / 插件菜单 / 指向插件的站点绑定由脚本自动剔除，不要手工绕开这段逻辑
- 导出结果里**不能出现 `SET` 语句**，含反斜杠的字面量必须写成 `E'...'`，否则 `update` 的 SQL 解析会判定为不安全而退化
- 即使本次没有数据库结构变更，也要重新导一次 `meadmin.sql`：`update` 的数据升级完全依赖它
