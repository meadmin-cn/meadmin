# CMS 演示数据导入说明

## 数据库配置

首先需要在 `.env` 文件中配置数据库连接信息：

```env
# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_DB=meadmin
DATABASE_SCHEMA=meadmin
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
```

## 导入步骤

### 1. 创建数据库和模式（如果还没有）

```sql
CREATE DATABASE meadmin;
\c meadmin
CREATE SCHEMA meadmin;
```

### 2. 安装 CMS 插件表结构

```bash
psql -U your_username -d meadmin -f addons/cms/install.sql
```

### 3. 导入演示数据

```bash
psql -U your_username -d meadmin -f addons/cms/demo-data.sql
```

## 演示数据内容

### 栏目（8个）
- 科技资讯
  - 人工智能
  - 前端开发
- 产品设计
  - UI设计
  - UX设计
- 创业故事
- 行业观察

### 标签（20个）
Vue3, React, TypeScript, Node.js, AI大模型, ChatGPT, 深度学习, Figma, 用户体验, 交互设计, 云原生, DevOps, 微服务, 数据可视化, WebGL, 低代码, 开源项目, 性能优化, 安全, 架构设计

### Banner轮播（4个）
- AI大模型应用开发实战
- Vue3 + TypeScript 最佳实践
- 设计系统构建指南
- 微服务架构演进之路

### 文章（10篇）
1. AI大模型应用开发实战指南
2. Vue3组合式API深度解析
3. 企业级设计系统构建实战
4. 微服务架构演进之路
5. TypeScript高级类型系统详解
6. WebGL与Three.js 3D可视化实战
7. Node.js性能优化完全指南
8. 用户体验设计的十大原则
9. DevOps实践：从CI/CD到GitOps
10. 低代码平台技术架构解析

### 评论（10条）
为前6篇文章添加了真实的评论数据

## 图片说明

演示数据中使用的图片来自 Unsplash（免费高质量图片库），包括：
- AI/科技主题
- 编程/开发主题
- 设计/UI主题
- 数据可视化主题

所有图片URL都已优化为适合网页展示的尺寸（1200x600 用于Banner，800x450 用于文章封面）。

## 访问演示

导入数据后，访问以下地址查看效果：

- 前台首页: http://localhost:7001/aon/cms
- 后台管理: http://localhost:7001/admin

## 注意事项

1. 执行 SQL 前请确保数据库连接正常
2. 如果已有旧数据，可以先清空表（demo-data.sql 中有注释的清空命令）
3. 所有文章状态为"已发布"(status=2)，可以直接在前台查看
4. 图片使用外链，需要网络连接才能正常显示
