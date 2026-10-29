# Me-Admin
[English](README.md) | [简体中文](README_CN.md)
## 简介

Me-Admin 是一个免费开源的nodejs + vue 全栈一站式中后台解决方案,后端基于medwayjs ,前台基于vue3构建，开箱即用。本项目采用最宽松的MIT协议，最新技术栈，助力你快速创建企业级web中后台项目。
## 相关文档
[https://www.meadmin.cn/](https://www.meadmin.cn/)

## 主要特性
- 基于typescript 应用级JavaScript 的语言
- 基于sequelize7 、midwayjs3.x、vue3、vite8、pinia、elment-plus、vue-request@next
- 提供一键生成CRUD与菜单的自动化能力，大幅简化开发流程，显著提升项目构建效率
- 搭载完善的Auth权限控制，支持无限父子级分组与自由授权，管理员可跨组别，权限配置既灵活又严密。
- 提供开箱即用的前台服务端渲染能力
- 可配置主题 可配置主题色及主题模式
- 友好的国际化方案 前端支持按组件异步加载语言包。
- 自定义keepAlive缓存 可根据key进行vue keep-alive,解决不同路由统一组件不能独立刷新缓存问题
- 权限 内置完善的动态路由权限生成方案，按钮级权限。支持前端菜单和接口动态获取菜单两种模式
- 组件自动按需引入 自动按需引入components下的组件定义,支持自定义引入位置和模式，真正的按需引入。
- 便捷的类型自动生成 自动生成ts type 最大程度减少工作量
- 集成vxeTable 功能最完善的国人开源vue table组件

## 技术栈
- typescript
- 缓存 reids
- 数据库 pgsql
- 后端 nodejs、midwayjs v3.x
- 前端 vue3、vite、element-plus

## 快速启动

### 依赖环境
- pgsql数据库
- redis缓存数据库
- nodejs >= 22.14.0
- pnpm
### 初始化项目

执行命令 `pnpm create meadminjs@latest` 根据提示，配置选项即可！

### 调试项目

- 在项目根目录执行 `pnpm dev`
- 后台访问 [http://127.0.0.1:7001/admin](http://127.0.0.1:7001/admin)
- 前台访问 [http://127.0.0.1:7001/](http://127.0.0.1:7001/)

### 打包项目
- pnpm build

### 默认账户

## 后台
默认账户 admin
默认密码 meAdmin#202507!P

## 前台
默认账户 test
默认密码 123456789

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



