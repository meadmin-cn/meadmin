import { Controller, Get } from '@midwayjs/core';
import { BaseController } from './base.controller.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，规避get请求缓存，统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('index')
export class IndexController extends BaseController {
  @Get('/', { summary: '网站介绍' })
  async index() {
    return this.success({
      banner: [
        {
          title: '高效的开发体验',
          content: '提供一键生成CRUD与菜单的自动化能力，大幅简化开发流程，显著提升项目构建效率。',
          bgImg: '/index/images/layout/bannerCode.jpg',
        },
        {
          title: '开箱即用的服务端渲染',
          content: '前台页面默认集成服务端渲染（SSR），有效提升首屏加载速度，并优化SEO效果，助力内容更好收录。',
          bgImg: '/index/images/layout/bannerManage.jpg',
        },
        {
          title: '强大的权限管理',
          content: '搭载完善的Auth权限控制，支持无限父子级分组与自由授权，管理员可跨组别，权限配置既灵活又严密。',
          bgImg: '/index/images/layout/bannerGift.jpg',
        },
      ],
      info: [
        {
          title: '我们的优势',
          desc: 'Me-Admin是你不错的选择',
          list: [
            {
              title: '最新技术栈',
              content: '基于Vue3、Vite、TypeScript、Pinia、Vue-request、Element-plus等最新技术栈开发',
            },
            {
              title: 'CRUD',
              content: '命令行一键生成控制器、模型、视图和JS文件,同时可一键生成后台菜单权限',
            },
            {
              title: '按需引入',
              content: '便捷的组件自动按需引入，真正的按需引入，type自动生成，极大方便开发',
            },
          ],
        },
        {
          title: '为什么选择我们',
          desc: '全栈项目的推荐方案',
          list: [
            {
              title: '开源免费无加密',
              content: 'Me-Admin快速开发框架无需授权即可商业使用，代码全部开源免费且无任何加密。',
            },
            {
              title: '灵活的插件机制',
              content: '灵活的插件机制,拥有丰富的插件和扩展,可快速安装卸载，目前正在积极完善插件资源中',
            },
            {
              title: '社区氛围良好',
              content: '开放的社区氛围，大家一起共同进步',
            },
          ],
        },
      ],
    });
  }
}
