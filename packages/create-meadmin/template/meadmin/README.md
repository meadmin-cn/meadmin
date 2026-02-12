# meadmin

## 简介

Me-admin 是一个免费开源的后台解决方案,后端基于medwayjs ,前台基于vue3构建，开箱即用。本项目采用最宽松的MIT协议，最新技术栈，助力你快速创建企业级web城乡。
## 相关文档
[https://www.meadmin.cn/](https://www.meadmin.cn/)

## 主要特性
- 基于typescript 应用级JavaScript 的语言
- 基于sequelize7 、midwayjs3.x、vue3、vite7、pinia、elment-plus、vue-request@next
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

执行命令 `pnpm create meadminjs` 根据提示数据配置选项即可！

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


