# Meadmin CMS 插件

基于 Midway 3 + TypeScript + Vue 3 的现代化内容管理系统（CMS）插件，实现完整的核心内容管理功能。

## 安装

遵循 meadmin 标准插件规范，**一条命令安装，演示数据随安装强制携带**：

```bash
npx meadmin addon cms
```

执行后自动完成：复制插件代码（`template/`）→ 执行 `installShells`（安装封面与示例下载资源、把 `meadmin-addons-cms` 加入后台/前台两个工作区的依赖、执行 `pnpm install` 安装插件自身依赖如 `dompurify`）→ 执行 `install.sql`（建表 + 权限菜单 + 携带演示数据）。装完即可访问前台查看演示效果。

> **插件只写自己的目录**：`template/` 里只有 `src/app/*/addons/cms`、`src/entities/aonCms*.entity.ts`、`view/*/src/addons/cms` 这些插件自有文件，不会覆盖宿主项目的 `view/index/src/layout/**` 等框架文件。
> 前台导航所需的 `Header` 的 `menus`/`active` 属性、菜单溢出折叠、以及路由切换时的空白 fallback（`layout/default/page.vue`）都属于框架能力，由 `@meadmin/core` 提供；请确保宿主框架 **>= 1.3.6**，老项目先执行 `npx meadmin update` 再装插件。

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

## 站点域名绑定与伪静态

CMS 的默认地址是 `/aon/cms/...`。想让 `cms.example.com` 直接访问站点、并把栏目页/详情页显示成 `/category/news`、`/article/hello.html` 这类地址，用后台「系统设置 → 站点与伪静态」配置即可，**不需要改动 nginx**：伪静态由前端路由 alias 完成，地址栏保留对外地址，匹配到的仍是 `/aon/cms/...` 真实路由。

### 一、新增站点

进入「系统设置 → 站点与伪静态」，点左上「新增站点」：

| 字段 | 填写示例 | 说明 |
|------|----------|------|
| 站点名称 | `CMS 站` | 仅后台展示 |
| 绑定域名 | `cms.example.com`、`*.example.com` | 每行一个；不带协议与端口；支持 `*.` 通配子域名 |
| 根路径映射 | `/aon/cms` | 该站点真实路由前缀，CMS 固定填 `/aon/cms`。**这个字段就是前缀重写开关**，见下文 |
| 状态 | 启用 | 禁用后该域名回到框架默认站点 |

### 二、常规路由：配好根路径映射就够了

「根路径映射」不只是把域名根路径指到某个页面，它表示：**该前缀下的所有前端路由，都会自动对外去掉这个前缀**。所以 CMS 的常规页面不需要写任何规则：

| 真实路由 | 自动对外地址 |
|----------|--------------|
| `/aon/cms` | `/` |
| `/aon/cms/category/:slug` | `/category/:slug` |
| `/aon/cms/tag/:slug` | `/tag/:slug` |
| `/aon/cms/article/:slug` | `/article/:slug` |
| `/aon/cms/page/:slug` | `/page/:slug` |
| `/aon/cms/topic/:slug` | `/topic/:slug` |
| `/aon/cms/form/:diyname` | `/form/:diyname` |

几点行为说明：

- `index` 段在对外地址里省略，所以站点首页是 `/`（同时保留 `/index` 以兼容框架固定入口）。
- 插件后续新增的前端路由会自动继承这套映射，不用回来补规则。
- 站内链接会自动写回对外地址：点栏目、文章链接时地址栏保持 `/category/news`、`/article/hello`，不会跳回 `/aon/cms/...`。
- 同一个站点只支持一个根路径映射（一个前缀）；要挂多个前缀，用下方「特例规则」补。

### 三、特例才需要加规则

规则表用来处理「不按前缀走」的特殊需求，点「新增规则」逐条添加：

| 需求 | URL 模式 | 目标路由 | 效果 |
|------|----------|----------|------|
| 内容页加 `.html` 后缀 | `~ ^/article/([^/]+)\.html$` | `/aon/cms/article/:slug` | `/article/hello.html` 也能打开，`.html` 不会出现在站内链接里 |
| 文章短链接 | `~ ^/p/([^/]+)$` | `/aon/cms/article/:slug` | `/p/hello` 等价于 `/article/hello` |
| 栏目短链接 | `~ ^/c/([^/]+)$` | `/aon/cms/category/:slug` | `/c/news` 等价于 `/category/news` |

URL 模式使用 nginx `location` 风格的模糊匹配写法：

| 修饰符 | 写法 | 匹配规则 |
|--------|------|----------|
| `=` | `= /` | 精确匹配，只命中这一个地址 |
| `^~` | `^~ /category/:slug` | 前缀匹配，优先级高于正则 |
| `~` | `~ ^/article/([^/]+)$` | 正则匹配，捕获分组顺序对应目标路由参数 |
| `~*` | `~* ^/News/([^/]+)$` | 同正则，忽略大小写（路由匹配本身不区分大小写） |
| 无 | `/tag/:slug` | 路径模板，参数名需与目标路由一致 |

匹配优先级：`=` 精确 > `^~` 前缀 > `~` / `~*` 正则 > 无修饰符 > 根路径映射派生。

- 根路径映射派生的地址优先用于**生成站内链接**，所以配了 `.html` 规则后，站内链接仍然是干净的 `/article/hello`，`.html` 只多提供一个入口。
- 目标路由必须是真实存在的前端路由，否则该规则不会生效，列表「生效地址」列会提示「无法编译」。
- 正则的捕获分组不能跨路径段（斜杠要写进字符类，如 `[^/]+`），不支持前瞻、非捕获分组与顶层通配符；目标路由既可按顺序对应具名参数（`:slug`），也可用 `$1`、`$2` 引用分组。
- 新增/编辑弹窗里的「编译结果」会实时显示该规则实际生效的别名与命中的路由，保存前即可确认写法正确。

### 四、验证

配置完成后直接访问域名即可：

- `http://cms.example.com/` → 站点首页，地址栏保持 `/`
- `http://cms.example.com/category/news` → 栏目页
- `http://cms.example.com/article/hello` → 文章详情
- `http://cms.example.com/article/hello.html` → 同一篇详情（若配了 `.html` 规则）

站内点击栏目、文章链接时地址栏同样保持对外地址，不会跳回 `/aon/cms/...`。

## 依赖

- `meadmin` 核心框架 **>= 1.3.6**（`@meadmin/core` + `@meadmin/midway-vite-view`）
- `dompurify` - HTML 消毒（正文展示），安装时由 `pnpm install` 自动装到插件目录

富文本编辑器复用宿主项目的 wangEditor 组件（`@wangeditor/editor`），由 meadmin 宿主提供，CMS 插件无需自带。

后端基于 meadmin 核心框架（Midway 3 + `@sequelize/core` + `@sequelize/postgres`），无需额外安装。

## 配置

数据库连接在 `src/config/database.ts` 中配置；`install.sql` 不写死 schema，建表跟随连接上的 `search_path`（来自项目的 `DATABASE_SCHEMA`）。

## 常见问题

**数据库连接失败**：检查 PostgreSQL 服务是否启动、`.env` 中数据库配置是否正确。

**权限不足（403）**：确认已为当前角色勾选 CMS 菜单权限。

**表不存在 / 字段缺失**：确认已执行 `install.sql`（`npx meadmin addon cms` 会自动执行），并核对 `search_path` 与实际 schema 一致。

**前台图片/下载 404**：确认已执行 `install-assets.mjs`，且 `public/index/images/cms/` 与 `public/files/` 下存在对应资源。

## 技术支持

如有问题或建议，请提交 Issue 或 PR 到 meadmin 项目仓库。
