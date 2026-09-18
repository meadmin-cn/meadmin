# meadmin AI 开发指南

本文档用于帮助后续 AI 快速理解 meadmin 项目的技术架构、代码习惯和开发约定。开发新功能或修改现有代码时，应优先遵循本文档；如果当前代码实现与本文档不一致，应先读取实际代码，再以项目现状为准进行兼容调整。

## 一、项目概况

- 项目名称：meadmin
- 项目定位：Node.js + Vue 3 全栈一站式中后台解决方案
- 仓库协议：MIT
- 后端：Midway 3、Koa、Sequelize 7、PostgreSQL、Redis
- 前端：Vue 3、Vite、Element Plus、Pinia、vxeTable
- 视图集成：`@meadmin/midway-vite-view`
- 包管理：pnpm workspace
- Node.js：使用 Node.js 22 及以上版本
- 代码语言：TypeScript 为主
- 框架文档: www.meadmin.cn/aon/doc

## 二、项目快速理解（基于 1.3.0 官方文档与当前代码）

### 2.1 项目定位

meadmin 是基于 Node.js + Vue 3 的全栈一站式中后台解决方案，不只是一个后台模板。项目同时提供：

- Midway 3.x + Koa 后端接口、Sequelize 7 ORM、PostgreSQL 持久化和 Redis 缓存。
- Vue 3 + Vite + Element Plus + Pinia + vxeTable 管理后台。
- `view/index` 前台应用和开箱即用的服务端渲染能力；管理后台本身暂不使用服务端渲染。
- 动态路由、菜单权限和按钮级权限，支持前端菜单与接口动态获取菜单两种模式。
- TypeScript 类型体系、Swagger/接口模型能力、组件和指令自动引入、类型自动生成、国际化和主题配置。
- `@meadmin/cli` 一键生成 CRUD、菜单及相关权限代码，降低新增业务模块的重复工作。
- 插件扩展机制，当前仓库通过 `addons/` 承载插件代码；插件可拥有独立的后端、前端和资源目录。

官方 1.3.0 文档入口：`https://www.meadmin.cn/aon/doc/1.3.0/`。

### 2.2 后端模块边界

- `src/app/admin/`：后台管理接口，按 `controller`、`dto`、`service` 分层；新增后台业务通常放在这里。
- `src/app/index/`：前台接口，结构与 admin 类似；不要把前台接口误放到 admin。
- `src/app/home.controller.ts`：页面渲染入口。
- `src/entities/`：Sequelize 实体、关联和数据库字段定义。
- `src/config/`：Midway、数据库、Redis、视图等配置；环境变量通过 `.env`、`.env.local`、`.env.prod` 管理。
- `src/decorators/`、`src/dto/`、`src/helper/`、`src/filter/`、`src/response/`、`src/ruleType/`：公共装饰器、DTO 基类、助手、异常、响应和校验规则。
- `src/dict/`、`src/locales/`：后端字典/枚举和多语言资源。
- `database/`：项目维护的手动 SQL、迁移和同步辅助文件；结构变更前必须先检查现有实体和 SQL。

后台请求通常通过 Controller 暴露接口，Controller 调用 Service，Service 使用实体和 Sequelize 完成查询/写入。权限由后台中间件、管理员上下文和 `AdminPermission` 等项目机制共同控制。

### 2.3 前端模块边界

`view/admin/src/` 的主要职责如下：

- `api/`：按业务模块封装后台 API。
- `views/`：页面和页面级组件；动态菜单的 `component` 必须与实际页面路径一致，例如 `system/config/index` 对应 `views/system/config/index.vue`。
- `components/`：自动按需引入的公共组件。
- `config/`：全局配置、登录、主题和国际化入口。
- `dict/`：前端字典定义。
- `router/`、`router/guard/`：动态路由和路由守卫。
- `store/`：Pinia 状态。
- `locales/`：全局语言包；页面自身可在页面目录放 `lang/`，按组件异步加载。
- `layout/`、`hooks/`、`directives/`、`utils/`、`styles/`、`icons/`：布局、公共逻辑、指令、工具、样式和图标。

`view/index/src/` 是前台应用，除拥有类似的 API、组件、配置、字典和状态目录外，还包含 `entry-client.ts`、`entry-server.ts`、SSR 页面和插件路由。前台插件页面通常放在 `addons/` 对应插件中，并通过插件自己的上下文共享跨组件数据。

### 2.4 核心能力与开发判断
- 除了`ruleType`文件夹的扩展定义文件 所有引入的`RuleType` 使用，import { RuleType } from '@/ruleType/index.js';
- 菜单树支持无限父子级；菜单权限和按钮权限都由菜单记录表达，按钮菜单使用项目约定的 `menuType = 3`。
- 页面路由是动态生成的，不能凭经验猜 URL 或静态路由文件；应从实际菜单树、管理员信息或页面导航确认路由。
- 角色、组织和菜单均使用项目既有的树模型；涉及树关系时优先检查 `parentId` 与 `left/right`，不要用普通平面列表逻辑替代。
- 多语言文本必须使用 `t()`，并同步维护页面或全局语言文件；不要新增硬编码页面文案。
- 主题支持主题色、浅色/暗黑模式；页面布局修改需要同时考虑桌面端和移动端。
- 公共组件优先使用项目已有组件和 Element Plus；表格场景优先复用 vxeTable 封装，不另起一套表格方案。
- 数据库结构变化优先生成 `database/migration/` 下的手动 SQL；只有明确确认后才使用会执行 `alter` 的同步命令。

### 2.5 CLI 与本地开发命令

项目根目录依赖 `@meadmin/cli`，可使用用户确认过的本地环境命令：

```bash
npx meadmin -m local sync *
npx meadmin -m local sync SystemMenu
npx meadmin -m local crud src/entities/example.entity.ts --model admin --menu
```

命令约定：

- `-m local`：在 CLI 执行前加载 local 环境变量；其他环境按项目实际配置替换。
- `sync <file>`：同步指定实体表结构；`<file>` 支持实体名、以空格分隔的多个实体名，或 `*` 表示全部实体。实现使用 Sequelize `sync({ alter: true })`，会修改数据库表结构，禁止在生产库或未确认环境执行。优先使用精确实体名，例如 `npx meadmin -m local sync "SystemConfigGroup SystemConfig"`，不要为了单个功能执行全量同步。
- `crud <entity>`：根据实体文件生成 CRUD。相对路径默认从 `src/entities` 查找；必须提供 `--model`，通常后台使用 `--model admin`。
- CRUD 可选参数包括 `--menu` 生成菜单、`--path` 指定前端/后端路径、`--controller` 指定控制器路径、`--coverage` 控制生成范围（`b` 后端、`a` 前端 API、`v` 前端页面、`p` 权限校验，默认 `bavp`）、`--addons` 生成到插件目录、`-f/--force` 强制覆盖、`--del` 删除已生成文件。
- 生成前应先读取实体字段、关联、注释和现有同类 CRUD；生成后必须人工检查 DTO 校验、权限规则、国际化、菜单父级和移动端布局，不能把 CLI 输出视为最终代码。
- 根目录常用脚本：`pnpm dev`（本地开发）、`pnpm build`（构建）、`pnpm test`（测试）、`pnpm lint`（检查）、`pnpm type-check`（后端与模板类型检查）。


```text
src/                         Midway 后端应用
src/controller/              控制器
src/service/                 服务
src/entities/                Sequelize 实体
src/dto/                     DTO 和请求校验
src/dict/                    字典和枚举
src/helper/                  通用助手函数
src/config/                  配置
packages/cli                 @meadmin/cli
packages/core               @meadmin/core
packages/create-meadmin     create-meadminjs 脚手架
packages/midway-vite-view   Midway + Vite 集成
view/admin                  后台管理前端
view/index                  前台和 SSR 页面
addons/                     插件
 database/                  手动数据库迁移和同步脚本
 test/                      测试
```

## 三、通用开发原则

1. 先读取相关实体、服务、DTO、前端 API 和现有调用方式，再进行修改。
2. 优先复用项目已有的模型、服务、装饰器和 Sequelize 能力，不重复造轮子。
3. 修改范围要聚焦，不能为了实现单个功能大范围重构无关代码。
4. 不要连接生产数据库，也不要自动执行数据库结构同步或迁移。
5. 需要数据库结构变化时，只生成手动执行的 SQL 文件，放在 `database/migration/`，由开发者手动执行。
6. 不要猜测数据库表名、字段名或关联关系。必须先读取实体和现有 SQL。
7. 新增函数优先使用箭头函数，例如：

   ```ts
   export const getSomething = () => {};
   ```

8. 后端新增注释使用中文。枚举数字类型必须在类型定义旁写清楚每个值的含义。
9. 优先保持同步/异步接口与现有调用方式一致。需要改变为异步时，必须同步修改所有调用方和测试。
10. 不要为了类型“看起来完整”增加过度封装、无实际使用的类型或结果对象。

## 四、后端代码习惯

### 4.1 实体

- 使用 Sequelize 7 装饰器和项目已有的实体基类。
- 字段类型要与数据库实际类型保持一致。
- 数据库中的枚举字段优先使用短整数或整数类型，不使用字符串类型。
- 例如数据权限字段应使用：

  ```ts
  @Attribute({
    defaultValue: 1,
    allowNull: false,
    type: DataTypes.TINYINT.UNSIGNED,
  })
  @ApiPropertyRule({
    description: '数据权限',
    rule: RuleType.number().valid(1, 2, 3, 4).default(1),
  })
  dataScope: number;
  ```

- 不要在后端为了四个固定数字专门创建枚举，优先使用数字联合类型：

  ```ts
  // 数据权限: 1=全部; 2=组织; 3=组织及以下; 4=仅本人
  type DataScope = 1 | 2 | 3 | 4;
  ```

- 所有类似 `1 | 2 | 3 | 4` 的特定数字类型，都必须写明对应值的中文含义。
- 关联查询应使用实体已有的 association、`include` 和仓储，不要手工拼接无依据的查询。
- 临时返回字段如果不是数据库字段，优先在局部类型中扩展，避免污染通用实体属性和列表查询类型。

### 4.2 DTO 和校验

- DTO 优先继承项目已有的 `PickDtoType`、`OmitDtoType`、`PartialType`、`RequiredType` 或 `IntersectionType`。
- 校验规则必须与实体字段类型一致。
- 数字枚举使用 `RuleType.number().valid(...)`，不要使用字符串校验。

### 4.3 服务

- 服务之间优先使用 Midway 依赖注入。
- 参考现有 `AdminMiddleware` 获取管理员身份的方式。
- 管理员信息应优先从请求上下文获取：

  ```ts
  getContext()?.adminInfo
  ```

- `LoginService` 负责加载管理员的角色、组织等完整信息。
- 通用助手函数尽量只消费已经加载好的数据，不要在助手内部再次查询数据库。
- 无请求上下文的后台任务或测试场景，支持显式传入需要的管理员对象。



## 五、数据库同步约定

数据库结构变更只输出 SQL，不自动连接数据库执行。

数据权限迁移示例：

```sql
ALTER TABLE "system_role"
  ADD COLUMN IF NOT EXISTS "data_scope" smallint NOT NULL DEFAULT 1;

ALTER TABLE "system_role"
  ADD CONSTRAINT "system_role_data_scope_check"
  CHECK ("data_scope" IN (1, 2, 3, 4));
```

要求：

- SQL 必须明确字段类型、默认值和约束。
- 旧数据需要安全回填，避免升级后意外缩小权限。
- 迁移文件可以执行针对新表的建表、初始化、插入或更新 SQL。
- 针对本次任务创建新表可以调用 npx meadmin -m local sync 命令同步表结构，也可以针对新表 执行数据库，增加、删除、修改操作。

### 5.1 本项目已确认的数据库操作授权

用户已明确授权：对本次开发新增的系统配置表，可以执行表结构同步，以及针对这些新表的插入、更新和初始化 SQL。该授权不等同于全库写入授权，范围如下：

- 允许同步的新表：`system_config_group`、`system_config`。
- 允许执行的 SQL：上述新表的建表、字段默认值修复、初始化数据插入和幂等更新。
- 不允许据此操作的对象：旧业务表、角色/菜单/组织关联数据、生产库或未确认的其他数据库。
- 推荐命令：`npx meadmin -m local sync "SystemConfigGroup SystemConfig"`；不要为单个功能执行 `sync *`。
- 执行写入后必须进行只读核对，确认表结构、内置分组、配置项数量和关键字段；不得把授权写入凭据、密码或 token 到代码、日志或本指南。
- 如果后续需要操作其他新表，或需要修改既有业务表，必须重新取得明确授权，不能沿用本次授权自行扩大范围。

## 六、前端开发约定

- 前端使用 Vue 3、TypeScript、Element Plus、Pinia。
- 后端整数枚举同步到前端时也使用数字，不要改回字符串。
- `el-radio`、字典和 API 类型的值必须统一：

  ```ts
  dataScope = 3 as 1 | 2 | 3 | 4;
  ```

- 数据权限字典示例：

  ```ts
  dataScope: [
    { value: 1, label: t('全部数据权限') },
    { value: 2, label: t('组织数据权限') },
    { value: 3, label: t('组织及以下数据权限') },
    { value: 4, label: t('仅本人数据权限') },
  ]
  ```

- 角色编辑页面使用互斥单选。
- 角色详情页面显示数据权限名称。
- 国际化文本需要同步维护中文和英文语言文件。
- 优先复用项目已有的 `me-icon`、SVG 图标和 Element Plus 组件。
- 修改布局时同时考虑桌面端、移动端、浅色模式和暗黑模式。



## 八、注释规范

- 新增注释统一使用中文。
- 注释应解释业务含义、字段值或实现原因，不要写无意义的重复注释。
- 数字联合类型必须附带值说明，例如：

  ```ts
  // 执行策略: 1=立即执行; 2=延时执行; 3=定时执行; 4=放弃执行
  strategy: 1 | 2 | 3 | 4;
  ```

- 不要为了说明简单代码添加过多注释。
- 保留项目原有的必要注释，但修改附近代码时可以顺手修正明显的英文或错误注释。

## 九、测试和验证

常用命令：

```bash
pnpm dev
pnpm build
pnpm test
pnpm lint
pnpm type-check
```

后端类型检查：

```bash
node ./node_modules/typescript/bin/tsc --noEmit
```

前端类型检查：

```bash
pnpm exec vue-tsc -b --noEmit
```

验证要求：

1. 修改后端 TypeScript 必须执行后端类型检查。
2. 修改前端 Vue 或 TypeScript 必须执行前端类型检查。
3. 涉及菜单、布局或响应式页面时，应使用浏览器或 Playwright 检查桌面端和移动端。
4. 涉及暗黑模式时，应同时检查浅色和暗黑模式。

## 十、后台登录与页面操作流程

本节记录已验证的本地后台登录流程，供后续 AI 执行浏览器验证、菜单权限配置或页面测试时参考。

### 10.1 操作边界

- 涉及菜单、角色、组织或按钮权限的操作，优先通过浏览器页面或已认证 HTTP 接口完成。
- 用户明确允许通过接口操作时，可以调用业务接口；禁止为了完成页面配置直接连接 PostgreSQL 或修改关联表。
- 后台地址、登录账号和密码只从项目 `README.md` / `README_EN.md` 的当前内容读取，不要把密码复制到本指南、脚本或日志中。
- Redis 主机、端口和密码只从 `.env.local` 读取，不要硬编码到脚本或提交到 Git。
- 每次操作前先读取实际控制器、DTO、前端 API 和动态路由，不要凭经验猜测接口字段或页面路径。

### 10.2 已验证的登录接口流程

1. 确认本地服务已启动，并访问后台地址 。
2. 调用验证码接口：

   ```text
   GET /api/admin/login/captcha?width=120&height=40
   ```

3. 从响应 `data.id` 取得 `captchaId`。响应还会返回 `imageBase64`，前端直接将其作为验证码图片地址。
4. 验证码由 `@midwayjs/captcha` 生成，Redis key 规则已经从 `src/app/admin/controller/login.controller.ts` 和运行结果确认：

   ```text
   midway:vc:{captchaId}
   ```

5. 使用 `.env.local` 中的 Redis 连接信息读取该 key。Redis 返回值是 RESP bulk string，内容可能带 JSON 字符串引号；提交登录前需要解析为实际验证码文本，而不是把 RESP 协议头一起提交。
6. 调用登录接口：

   ```text
   POST /api/admin/login/login
   Content-Type: application/json
   ```

   请求体字段必须包含：

   ```json
   {
     "username": "README 中的账号",
     "password": "README 中的密码",
     "captchaId": "验证码接口返回的 id",
     "captcha": "Redis 中读取的验证码"
   }
   ```

7. 判断响应 `code === "200"`，从 `data.token` 取得后台 token。后续接口使用：

   ```text
   Authorization: Bearer {token}
   ```

8. token 仅用于当前验证流程，不要写入项目文件、日志或提交记录。

### 10.3 浏览器自动化注意点

- 当前环境中 `agent-browser` 命令可能不在 PATH；如果命令不存在，优先使用已安装的 Playwright 包和隔离 Node.js 运行时，不要反复假设命令可用。
- 已验证的 Playwright 模块位置为 WorkBuddy 隔离 Node workspace 下的 `node_modules/playwright`；运行时优先使用 WorkBuddy 提供的 Node.js 22 绝对路径。
- 后台页面能打开不代表业务路由可直接猜测。登录后前端会根据管理员菜单动态生成路由，直接访问不存在或猜错的路径可能返回 404；应先读取登录信息中的菜单，或从页面实际导航进入目标页面。
- 如果使用接口拿到 token，浏览器页面需要在同一域名下设置 `auth-token` Cookie，或者直接让 Playwright 完成登录，以便前端路由守卫识别登录态。
- 验证码必须在有效期内读取并提交；每次验证码请求都会产生新的 `captchaId`，不能混用旧 ID 和新验证码。
- README 中的默认密码必须严格按文件原文使用。本次失败原因是误把密码末尾前的空格一并提交；正确值以 README 当前内容为准。
- 登录失败时先区分验证码错误、用户名/密码错误和 token/权限问题，不要直接修改数据库或重置数据。

### 10.4 菜单权限配置注意点

- 创建按钮权限前先调用菜单树接口确认目标父级菜单 ID、菜单类型和现有权限标识：

  ```text
  GET /api/admin/system/menu/treeAll
  ```

- 按钮菜单的 `menuType` 必须为 `3`，`parentId` 必须指向实际业务菜单或角色组菜单。
- 常用新增接口：

  ```text
  POST /api/admin/system/menu/add
  ```

- 创建前检查权限标识是否已存在，避免违反 `system_menu.rule` 唯一约束；创建后核对响应中的 `id`、`parentId`、`menuType` 和 `rule`。
- 本项目树修复按钮的权限标识为：
  - `system_menu_perfect_tree`
  - `system_organization_perfect_tree`
  - `system_role_perfect_tree`
- 新增或修改菜单后，前端菜单和路由可能需要重新获取管理员信息或刷新页面才能显示；不能只根据接口成功就断言页面已经更新。
- 本次验证中，三个按钮均通过已认证接口创建成功并返回 `code: "200"`；未直接操作数据库。
5. 数据权限助手测试不能依赖数据库连接，优先传入模拟管理员对象验证四种权限。
6. 如果测试命令退出码异常或没有可读输出，不要宣称测试通过，应准确说明验证范围和限制。

## 十二、Windows 环境注意事项

- 优先使用绝对路径。
- Node.js 和 Python 优先使用 WorkBuddy 提供的托管运行时。
- Windows 下 Bash 可能存在 `dirname`、路径或编码问题；必要时改用 PowerShell。
- 中文路径和中文选择器可能造成脚本编码问题，自动化脚本优先使用稳定的英文属性、索引或 DOM 结构定位。
- 编辑文件优先使用专用文件读写工具，避免 Bash heredoc 在 Windows 下产生编码问题。
- 修改个人目录文件时必须谨慎，项目内文件优先限定在当前工作区。

## 十三、提交前检查清单

- [ ] 已读取相关实体、服务、DTO 和前端调用代码。
- [ ] 没有误改无关文件。
- [ ] 新增后端枚举字段使用整数类型。
- [ ] 数字联合类型旁已有完整中文值说明。
- [ ] 所有新增函数优先使用箭头函数。
- [ ] 空组织范围返回永不匹配条件。
- [ ] 数据库变更只生成手动 SQL，没有自动执行。
- [ ] 后端类型检查通过。
- [ ] 前端类型检查通过（如果修改了前端）。
- [ ] 页面改动已检查响应式、浅色和暗黑模式（如果适用）。
- [ ] 去浏览器进行实际操作测试再交付，如果不通过测试分析原因，重新修复。
