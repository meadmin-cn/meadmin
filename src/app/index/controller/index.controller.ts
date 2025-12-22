import { Controller, Get } from '@midwayjs/core';
import { BaseController } from './base.controller.js';
import { IndexPermission } from '@/decorators/index.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，规避get请求缓存，统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('index')
export class IndexController extends BaseController {
  @IndexPermission()
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
              title: '国际化',
              content: '独创的组件国际化语言包，开发便捷、按需加载',
            },
            {
              title: '按需引入',
              content: '便捷的组件自动按需引入，真正的按需引入，type自动生成，极大方便开发',
            },
          ],
        },
        {
          title: '我们的优势',
          desc: 'Me-Admin是你不错的选择',
          list: [
            {
              title: '最新技术栈',
              content: '基于Vue3、Vite、TypeScript、Pinia、Vue-request、Element-plus等最新技术栈开发',
            },
            {
              title: '国际化',
              content: '独创的组件国际化语言包，开发便捷、按需加载',
            },
            {
              title: '按需引入',
              content: '便捷的组件自动按需引入，真正的按需引入，type自动生成，极大方便开发',
            },
          ],
        },
      ],
    });
  }
}
