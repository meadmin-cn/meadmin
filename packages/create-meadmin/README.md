# create-meadminjs

meadmin 的项目创建与模板发布工具。

## 创建新项目

```bash
npx create-meadminjs my-admin
```

按提示输入项目目录、完善 `.env` 中的数据库与 Redis 配置，命令会把内置模板拷贝到目标目录并同步数据库结构。

## 发布模板（维护者）

发布前必须让模板里的 `meadmin.sql` 与源码保持一致的「干净核心」状态：不含插件表、不含插件菜单，且菜单树的左右边界正确。

```bash
# 在 meadmin 仓库根目录执行
node packages/create-meadmin/bin/cli.js meadmin
```

其他环境（发布到 npm 之后，在任意目录下）：

```bash
npx --package=create-meadminjs create-meadminjs-cli meadmin
```

> `create-meadminjs-cli` 是 `create-meadminjs` 包里的 bin 名，**不是包名**。直接写 `npx create-meadminjs-cli ...` 会让 npm 去仓库里找同名包并报错，必须用 `npx --package=create-meadminjs create-meadminjs-cli ...` 或 `npm exec -p create-meadminjs -- create-meadminjs-cli ...`。

一条命令完成全部步骤，全程**只读数据库**，不会改动线上库，因此也不需要「先备份、再删除、最后还原」：

| 步骤 | 动作 |
| --- | --- |
| 1 | 读取数据库配置（默认依次查找 `.env.local`、`.env`），连接数据库 |
| 2 | 识别插件表（`aon_` 前缀）与插件菜单（`addons_` 根菜单及其全部后代） |
| 3 | 生成干净的 `meadmin.sql`：剔除插件表、剔除插件菜单、按 `parent_id` 重算 `left`/`right`、清理指向插件的关联行，并去掉 `meadmin.` 模式名前缀 |
| 4 | 校验菜单树：左右边界成对唯一、子级落在父级区间内 |
| 5 | 生成完整备份 SQL（含插件表，仅用于回溯） |
| 6 | 把生成的 SQL 导入临时 schema，核对表数量、行数、父子引用与角色菜单关联，通过后删除临时 schema |
| 7 | 写入 `meadmin.sql`，旧文件与备份归档到 `.workbuddy/release/` |
| 8 | 生成 `packages/create-meadmin/template/meadmin` 模板（自动排除 `addons` 插件源码与依赖） |

常用参数：

```bash
node packages/create-meadmin/bin/cli.js meadmin --dry-run          # 只导出与校验，不写文件
node packages/create-meadmin/bin/cli.js meadmin --skip-template    # 只更新 meadmin.sql
node packages/create-meadmin/bin/cli.js meadmin --only-template    # 只用现有 meadmin.sql 生成模板
node packages/create-meadmin/bin/cli.js meadmin --keep-addon doc   # 数据库层面保留某个插件的表与菜单（模板仍不含插件源码）
node packages/create-meadmin/bin/cli.js meadmin --env .env.prod --schema meadmin
```

插件判定约定：表名以 `aon_` 开头即为插件表；权限规则以 `addons_` 开头的是插件根菜单，它连同全部后代菜单一起移除；权限规则以 `aon_` 开头但父级已不存在的历史残留菜单同样会被清掉。未匹配到的表与菜单原样保留。

## 其他命令

```bash
node packages/create-meadmin/bin/cli.js meadmin                                      # 一键发布（导出 SQL + 生成模板）
node packages/create-meadmin/bin/cli.js setMeadminTemplate meadmin   # 仅重新生成模板，简写 setTemplate
node packages/create-meadmin/bin/cli.js version 1.3.16               # 统一修改 workspace 内所有包版本号
```
