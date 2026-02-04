# midway-vite-view

meadmin 的 midway+vite 服务端渲染和客户端渲染组件,支持Vite2、Vite3,支持多vite项目并存。


### github
[https://github.com/yuntian001/midway-vite-view](https://github.com/yuntian001/midway-vite-view)

### 使用示例
[https://github.com/yuntian001/midway-vite-view/tree/main/example](https://github.com/yuntian001/midway-vite-view/tree/main/example)

## 使用说明

midway+vite 依赖于静态文件托管组件：[@midwayjs/static-file@3](https://midwayjs.org/docs/extensions/static_file)

所有静态文件需要按照@midwayjs/static-file@3规则放在对应的文件夹中,@midwayjs/static-file@3默认的静态文件夹为public

| web 支持情况| |
|     ---    | --- |
| @midwayjs/koa |	✅ |
| @midwayjs/faas | ✅ |
| @midwayjs/web	 | ✅ |
| @midwayjs/express	| ❌ |

## 代码示例

[example/](./example/)

## 快速开始
- 安装组件扩展包
```bash
$ npm install vite
$ npm install midway-vite-view
```
- 项目根目录下新建public文件夹
- view 文件夹下创建放入对应vue项目
- midway configuration.ts中引入视图文件
```
import * as viteView from 'midway-vite-view';//引入view组件
@Configuration({
  imports: [
    //其余代码不变
    viteView, //导入view组件
  ],
})
//其余代码不变
```

- midway 中加入配置文件

```
  view: { //midwayjs 视图配置 说明参考 https://midwayjs.org/docs/extensions/render
    defaultViewEngine: 'viteView',
  },
  viteView: { //midway-vite-view 配置配置详细说明见下方
    rootDir:'view',
    views: {
      'admin': {//相对于rootDir的前端包路径
        // entryServer: 'admin/src/entry-server.ts',//admin暂未支持服务端渲染
        entry: 'index.html',//html入库文件，相对于当前包路径
        viteConfigFile: resolve(import.meta.dirname, '../../view/admin/vite.config.ts'),
        staticFileKey:'viewAdmin',
        hmrPort:23679,
      },
      'index': {//相对于rootDir的前端包路径
        entryServer: 'src/entry-server.ts',
        entry: 'index.html',//html入库文件，相对于当前包路径
        viteConfigFile: resolve(import.meta.dirname, '../../view/index/vite.config.ts'),
        staticFileKey:'viewIndex',
        hmrPort:23680,
      },
    },
  },
  staticFile: {
    dirs: {
      default: {
        prefix: '/',
        dir: 'public',
      },
      viewAdmin:{
        prefix: '/html/admin/',
        dir: 'view/admin/dist',
      },
      viewIndex:{
        prefix: '/html/index/',
        dir: 'view/index/dist',
      },
    },
  },

```

- vite 配置文件中 按[示例](./example/)进行更改

- 控制器中调用
```
    //服务端渲染 
    return this.ctx.render('admin', {
      assign:{keyWords:'vite midway'},//html中{{keyWords}}的会被替换为vite midway
    });

    //客户端渲染
    return this.ctx.render('index',{
      ssr:false, //false代表强制客户端渲染,默认会根据配置自动匹配
      assign:{keyWords:'vite midway'},//html中{{keyWords}}的会被替换为vite midway
    });

```

- package.json中打包命令加入 && vite-view build
```
     "build": "midway-bin build -c && vite-view build"
```
## 配置说明

| 配置项      |类型|是否必须 | 说明 |
| -----------| ----------- | ----------- |----------- |
| prod      | boolean| 否 |是否是发布环境 如果不传用运行环境是否为prod/production以区分|
| rootDir | string | 否 | view根路径默认为`'view'`|
| views | `{[key:string]:string\|object}`  | 是 | key为前端项目根路径(相对于rootDir文件夹)，|

| views      |类型|是否必须 | 说明 |
| -----------| ----------- | ----------- |----------- |
| entryServer | string | 否 | 服务端渲染entry-server路径(相对于前端项目根路径) |
| viteConfigFile | string | 是 | vite config的文件地址，相对于前端项目根路径 |
| entry | string | 是 | 相对于前端项目文件夹的html文件路径|
| staticFileKey | string | 是 | 对应的staticFile.dirs的key |
| hmrPort | number | 是 | 热更新监听端口，会自动向上查找可用端口|

## 打包命令 vite-view build 参数说明
传参方式为 vite-view build

| 参数项      | 默认值 | 说明 |
| ---------- | ----------- |----------- |
| config | src/config |midway配置文件夹/配置文件|



## 规则说明
- 服务端渲染时`html` 文件中`<!--ssr-no-content-start-->` `<!--ssr-no-content-end-->`间的内容会被清空（客户端渲染时不做任何处理）
- 服务端渲染时`html` 文件中必须含有`<!--app-html-->`,输出时会替换为解析后的html内容
- 服务端渲染时`html` 文件中必须含有`<!--preload-links-->`,输出时会替换为资源引用语句
- vue 服务端渲染时不会触发响应性，建议`vue3`在setup中用顶层`await`获取数据