

## [1.3.6](https://github.com/meadmin-cn/meadmin/compare/main-1.3.4...main-1.3.6) (2026-08-29)


### 新功能[feat]

* 加上电话校验，后端校验多语言放到语言json文件中 ([ce67c9e](https://github.com/meadmin-cn/meadmin/commit/ce67c9e079fcec037a60f58c81bc064c7c8fbf36))
* 加上任务队列 ([39c6862](https://github.com/meadmin-cn/meadmin/commit/39c68620e2ea26361e37a981522b6865b9d89419))
* 加上组织表 ([81fcfb4](https://github.com/meadmin-cn/meadmin/commit/81fcfb4157f40d18a346a2ef5e71733a8bd94882))
* 设置create 最新模版 ([845c3b1](https://github.com/meadmin-cn/meadmin/commit/845c3b136eda732840fcd90c05b45d5720645fd4))
* **cli:** 加上归档部署文件命令compose ([afaa858](https://github.com/meadmin-cn/meadmin/commit/afaa8585a67515a484a151915e459dc2a11a0519))
* **cli:** 优化where类型 ([639f439](https://github.com/meadmin-cn/meadmin/commit/639f439d420bd8c9adda3d75654784d9a2278780))
* **meadmin:** 加上组织管理 ([722132a](https://github.com/meadmin-cn/meadmin/commit/722132ae3a698045adaafead3d2ebdb740ab45a1))
* **meadmin:** 加上组织相关文件 ([8bc82c6](https://github.com/meadmin-cn/meadmin/commit/8bc82c69a62e674b1c3aa722ef773a702ae35776))


### Bug 修复[fix]

* 修复类型错误，加上压缩函数 ([c9ebc3e](https://github.com/meadmin-cn/meadmin/commit/c9ebc3e37ec19c9a9d7702d8600ff541482970f5))
* 修复启动顺序导致单例命名空间冲突问题，设置队列启动不清楚定时任务 ([c5e920b](https://github.com/meadmin-cn/meadmin/commit/c5e920bc44b8db5137f65146e14210ddf55af360))
* 修复未排除关联属性导致ts报错bug ([390e07b](https://github.com/meadmin-cn/meadmin/commit/390e07b7ab78e576f556972bace32e7d9e803086))
* meadmin sql删除多余的菜单 ([c28cb97](https://github.com/meadmin-cn/meadmin/commit/c28cb97d6672c32eafb1c57da432c8cb7fa92107))
* **meadmin-view-admin:** 修复json组件渲染错误 ([0a8000c](https://github.com/meadmin-cn/meadmin/commit/0a8000c4e130cc792a980512b9c1effc0ef9a35b))
* **meadmin-view-admin:** 修复vite hmr端口占用冲突问题 ([684c4d0](https://github.com/meadmin-cn/meadmin/commit/684c4d02d10e02e5fd462a92f0c1a47686efa9a1))
* **meadmin-view-admin:** 修复vxetable 翻译错误问题 ([748922c](https://github.com/meadmin-cn/meadmin/commit/748922cc04623b039726f319976e0d77dbe39369))
* **meadmin:** 修复分开部署队列和网站时错误bug ([ba6de2d](https://github.com/meadmin-cn/meadmin/commit/ba6de2d95dec1207412482cd3eeb1249dbe71a4e))


### 其他[chore]

* 版本设置为1.3.5 ([5c9f657](https://github.com/meadmin-cn/meadmin/commit/5c9f657e0788519e28face0eca666b41b845c6ff))
* **meadmin:** seqlize 升级为 7.0.0-alpha.47 ([f65273b](https://github.com/meadmin-cn/meadmin/commit/f65273bd82f67fff36fbc757c24a8427e4f93b6d))
* **meadmin:** vite升级到8.2 ([5dbcf6d](https://github.com/meadmin-cn/meadmin/commit/5dbcf6d33a4b85d509580e7ba4f43129d604fb7b))


### 重构[refactor]

* 创建/更新组件 info类型写法优化 ([01680af](https://github.com/meadmin-cn/meadmin/commit/01680af58fdaaeec0486c4c80f503134ac41d3ef))


### 性能改进[perf]

* 升级vaxetable版本 优化可以取消选中组织 ([347cc10](https://github.com/meadmin-cn/meadmin/commit/347cc10979649eea023a80bd08c27447262177cf))


### CI发版[ci]

* 版本设置为1.3.6 ([7446ea3](https://github.com/meadmin-cn/meadmin/commit/7446ea33d0f17e3f11b33c2abda732f58a096ffd))
* **create-meadmin:** 更新1.3.5模板 ([bd66326](https://github.com/meadmin-cn/meadmin/commit/bd66326c9f301a29cdeeab112f2b92d89f36a2df))
* **create-meadmin:** 更新模板 ([a2ce4f5](https://github.com/meadmin-cn/meadmin/commit/a2ce4f5e415a26225fdc9c1f6992e64086047bc8))

## [1.3.4](https://github.com/meadmin-cn/meadmin/compare/main-1.3.3...main-1.3.4) (2026-05-20)


### 新功能[feat]

* **create-meadmin:** 创建模板时携带默认上传文件 ([a3d8c1a](https://github.com/meadmin-cn/meadmin/commit/a3d8c1af27cd12fd2602b785fc7fe85e713389c6))


### Bug 修复[fix]

* 删除老版本多余的ssr打包代码 ([bc101d5](https://github.com/meadmin-cn/meadmin/commit/bc101d59c62b0e286194bf360683bf003b47df32))
* 修复降级客户端渲染时，网站名不展示bug ([7e33bb5](https://github.com/meadmin-cn/meadmin/commit/7e33bb513377a062e07d790522269917c6eb956a))


### 其他[chore]

* 设备版本 ([bd12696](https://github.com/meadmin-cn/meadmin/commit/bd1269636f3bf1e6e0be415e54068e536f2a66c7))

## [1.3.3](https://github.com/meadmin-cn/meadmin/compare/main-1.3.2...main-1.3.3) (2026-05-20)


### Bug 修复[fix]

* 升级vite到8.0.13，修复服务端渲染丢失转换bug ([d9b79ec](https://github.com/meadmin-cn/meadmin/commit/d9b79ec7e65760bc940046ff2877c6c5bd88bc86))


### CI发版[ci]

* 设置版本 ([692fb1a](https://github.com/meadmin-cn/meadmin/commit/692fb1ae596672fe5bdf2673c7e2726a60da9509))

## [1.3.2](https://github.com/meadmin-cn/meadmin/compare/main-1.3.1...main-1.3.2) (2026-05-20)


### 新功能[feat]

* 加上控制台示例页 ([94f302f](https://github.com/meadmin-cn/meadmin/commit/94f302f3a1ccbca275913a3e67d563193fc693f8))
* 加上图标选择组件，菜单新增和修改支持图标选择 ([8490119](https://github.com/meadmin-cn/meadmin/commit/84901198d86c438ca1cdcd29eb5ecc500c115baa))
* **create-meadmin:** 加上 创建数据库输入识别 ([67d4c00](https://github.com/meadmin-cn/meadmin/commit/67d4c001f3ca7e6ce63064983ca4dcda9e93f018))


### Bug 修复[fix]

* 加上发布创建文件涵盖 gnore文件 ([4783b7c](https://github.com/meadmin-cn/meadmin/commit/4783b7c52fbd8cbf3a0f2a23940e6fc94be663f6))
* 修复空菜单渲染警告 ([38dc4d3](https://github.com/meadmin-cn/meadmin/commit/38dc4d39c09113458990de99f477a23d7f456b59))


### 其他[chore]

* 版本升级为1.3.1 ([cfffe02](https://github.com/meadmin-cn/meadmin/commit/cfffe029446104ba2352af8bad18ab7f11f4b08d))
* 忽略tsconfig.node.tsbuildinfo ([851d0a4](https://github.com/meadmin-cn/meadmin/commit/851d0a4dfad2af343176f533e89402af73528d02))
* 加上开源协议 ([afe9bea](https://github.com/meadmin-cn/meadmin/commit/afe9beacb61996adc45c4a3aafc9a50396d33907))
* 修改创建语句 ([6ff0b72](https://github.com/meadmin-cn/meadmin/commit/6ff0b722bb2125a3b18db3fcd43956879dc64dc0))
* **create-meadmin:** 更新模板 ([996ddc2](https://github.com/meadmin-cn/meadmin/commit/996ddc2e5cdce8de0560dc7be4574f3a1d1d6a7a))
* **create-meadmin:** 更新模板 ([eb208d0](https://github.com/meadmin-cn/meadmin/commit/eb208d0e3a200f650177c6d07a5178bc88bdcbf2))
* vite升级到8.0.10 ([1a326a5](https://github.com/meadmin-cn/meadmin/commit/1a326a52a4afd8e5c40433a68f0e4704f85e33a1))
* vite升级到8.0.9 ([b93f64a](https://github.com/meadmin-cn/meadmin/commit/b93f64abcfe9ca5ca03a424eddad04d1dc11f688))


### 性能改进[perf]

* 加上初始化图片加入忽略列表 ([02759e6](https://github.com/meadmin-cn/meadmin/commit/02759e6bebc353da159635adf4a1c2207cec4396))


### CI发版[ci]

* **create-meadmin:** 加上上传默认图片 ([920ae87](https://github.com/meadmin-cn/meadmin/commit/920ae8761322c2254fe5f43e24275c87a69b9e56))

## [1.3.1](https://github.com/meadmin-cn/meadmin/compare/main-1.2.3...main-1.3.1) (2026-04-11)


### 新功能[feat]

* 插件安装脚本加上 sql、命令不执行参数 ([94064a9](https://github.com/meadmin-cn/meadmin/commit/94064a9627526351e450c9c93a831b2cd33e7392))
* 缓存数据库放到env环境变量配置中 ([f32a00d](https://github.com/meadmin-cn/meadmin/commit/f32a00d245c7bf4ed45c0272c06d67907bd540e4))
* 加上 meadmin 英文说明 ([b41555b](https://github.com/meadmin-cn/meadmin/commit/b41555bed6ecb2b3ace73234d9d3ff8a7baf55ab))
* 前端检查脚本更改 ([940db57](https://github.com/meadmin-cn/meadmin/commit/940db57484933746676130a66215a44ae59904fd))
* eslint 修复，加上规则 ([66d396a](https://github.com/meadmin-cn/meadmin/commit/66d396ad5a971e15a984c495952665064c3b4898))
* vite 升级到8.0.7，ts设置为 strict 模式 ([3978934](https://github.com/meadmin-cn/meadmin/commit/3978934e21a6c70df8e881356bc738de9e0446c9))


### Bug 修复[fix]

* 前端类型修复 ([1bb0d2d](https://github.com/meadmin-cn/meadmin/commit/1bb0d2d9301f6a755acbf4f2a4f6ae92c77dd951))
* 修复 ts 类型错误 ([9ffde5c](https://github.com/meadmin-cn/meadmin/commit/9ffde5c10133df92ba9177fd7769dcdad9e5a4ff))
* 修复错误的git忽略 ([74b8260](https://github.com/meadmin-cn/meadmin/commit/74b8260b9dd4497e4649e8eeb0494e847eda6cae))
* 修复自动生成前端模板 import 为区分 type 引入 ([58dfab4](https://github.com/meadmin-cn/meadmin/commit/58dfab436b2ce43dc55866069dccbb7d84e53244))
* 修复ssr-manifest.jso暴露的安全问题 ([4da5205](https://github.com/meadmin-cn/meadmin/commit/4da5205826657433fa480f76e41a2ab99d9dcc67))
* 修复vite config 类型校验bug ([3b88269](https://github.com/meadmin-cn/meadmin/commit/3b88269947c7af4e7c7024b76d4e9722fc44e6f2))
* 自动生成支持ts strict模式 ([a4ba51d](https://github.com/meadmin-cn/meadmin/commit/a4ba51d357bb430383c72c83f16c40961e8302d7))
* doc 插件模板重新生成 ([12dcdff](https://github.com/meadmin-cn/meadmin/commit/12dcdffed10446e57047ea0f917b569531416b0b))
* **meadmin:** 修复多进程部署，验证码判断失败bug ([c2ce607](https://github.com/meadmin-cn/meadmin/commit/c2ce6071aea662d7bb5bb827c423df00f4d28ffd))
* **midway-vite-view:** 升级依赖包版本修复类型错误 ([f2944f5](https://github.com/meadmin-cn/meadmin/commit/f2944f5daae353f4ce565cd0c975568f62d2f8a2))


### 其他[chore]

* 移除多余的overrides ([015d44c](https://github.com/meadmin-cn/meadmin/commit/015d44c2b7321fc4342e0e3e3a014c743f6070ab))


### 文档更改[docs]

* 加上英文说明 ([a3a6882](https://github.com/meadmin-cn/meadmin/commit/a3a68825588d5823f1bc8c5b154e752ff22445e2))


### 性能改进[perf]

* **midway-vite-view:** 启动后立即创建vite server ([c867152](https://github.com/meadmin-cn/meadmin/commit/c8671523c3b03718fc41827ec91a3f00af1dad3f))


### CI发版[ci]

* 版本改为1.3.1 ([572a592](https://github.com/meadmin-cn/meadmin/commit/572a592cf2fde8e7b849a6f524080ae98857ddfb))
* 创建模板更改 ([81f69e4](https://github.com/meadmin-cn/meadmin/commit/81f69e49324bf651903e9a7538c8cd9ef4ed673e))
* 创建模板更改 ([dd4003b](https://github.com/meadmin-cn/meadmin/commit/dd4003b54553acdb1e2eef8949f26dd8ef31ee8c))

## [1.2.3](https://github.com/meadmin-cn/midway-meamdin/compare/main-1.2.2...main-1.2.3) (2026-04-02)


### 新功能[feat]

* 设置版本时同步设置meadmin的版本 ([a110bc0](https://github.com/meadmin-cn/midway-meamdin/commit/a110bc0710a75892be0b24593581ffa5ca9c3f47))


### Bug 修复[fix]

* 模板创建时生成tmp文件夹 ([7f916e3](https://github.com/meadmin-cn/midway-meamdin/commit/7f916e3cdb47ffbb402fe6b502ec7d9aae22fd45))
* **meadmin:** 修复打包后文件上传失败bug ([0ddf17c](https://github.com/meadmin-cn/midway-meamdin/commit/0ddf17cd8f26169757d03ecc50f4857059e34da2))


### 其他[chore]

* 版本升级到1.2.3 ([516f9cf](https://github.com/meadmin-cn/midway-meamdin/commit/516f9cf4ad7f403a7c63f94ba35a721ba34c5d7e))


### CI发版[ci]

* 更新发布模板 ([fb1dc48](https://github.com/meadmin-cn/midway-meamdin/commit/fb1dc48788a4563f7d3878cdab0867643f95e838))

## [1.2.2](https://github.com/meadmin-cn/midway-meamdin/compare/main-1.2.1...main-1.2.2) (2026-04-01)


### Bug 修复[fix]

* 修复前台linux下打包报错bug ([1bc42cd](https://github.com/meadmin-cn/midway-meamdin/commit/1bc42cd8945ea769e8c674d2c4fa046dbb4399ec))
* 移除多余的包，修复ssr渲染错误 ([ca624a5](https://github.com/meadmin-cn/midway-meamdin/commit/ca624a514933340f80e213e3ac8b5f5d960079fd))


### CI发版[ci]

* 版本设置为1.2.2 ([2455baf](https://github.com/meadmin-cn/midway-meamdin/commit/2455bafee92c83fe7dc71d213ca8fbe0dc65ae23))
* **create-meadmin:** 更新1.2.2模板 ([64d0906](https://github.com/meadmin-cn/midway-meamdin/commit/64d09063a274993ed3f37d485626957b4ac31d05))

## 1.2.1 (2026-04-01)


### 新功能[feat]

* 插件doc加上预览功能 ([57092bc](https://github.com/meadmin-cn/midway-meamdin/commit/57092bc600a446d3e31937dc14ca5fd503110008))
* 初始化 ([0ffc4f6](https://github.com/meadmin-cn/midway-meamdin/commit/0ffc4f6737e408c1ef4fa6d7ef74f4ab43d71abe))
* 创建模板生成 ([a47a783](https://github.com/meadmin-cn/midway-meamdin/commit/a47a7835e12305249612c997f3dd6a3fe3d21610))
* 调通后台登录 ([32e133f](https://github.com/meadmin-cn/midway-meamdin/commit/32e133fe15c41262a72f0695e9b77474f6953949))
* 调整entity格式和配置 ([25006ba](https://github.com/meadmin-cn/midway-meamdin/commit/25006ba8150f51c8f25d551f3d2b692e1c854aca))
* 格式化prettierrc加上import插件 ([df794b8](https://github.com/meadmin-cn/midway-meamdin/commit/df794b83bf39a6fb7b1c9af1e2154d0cfaee0056))
* 更新生成sql文件 ([e88542a](https://github.com/meadmin-cn/midway-meamdin/commit/e88542ab69951708d7aeb9c8a4bb0a3b763e1fa3))
* 关联模型的新增和编辑自动生成完成 ([aa319fe](https://github.com/meadmin-cn/midway-meamdin/commit/aa319febc87104864adcdbfcc1fdb7fee58013e1))
* 管理后台默认跳转第一个动态路由 ([4ac879f](https://github.com/meadmin-cn/midway-meamdin/commit/4ac879f194f06e9e861b0af0f6acd7a9ca94c63a))
* 集成meadmin-template(客户端渲染) ([83e1baf](https://github.com/meadmin-cn/midway-meamdin/commit/83e1baf303d731664bc1243de9cb1b99028dba22))
* 加上-m --module 参数设置env环境变量 ([aed116f](https://github.com/meadmin-cn/midway-meamdin/commit/aed116fb6b3ce7b6af48ecca0e5edc6890b21731))
* 加上@meadmin/cli，并建立sync数据表同步命令 ([5511aa5](https://github.com/meadmin-cn/midway-meamdin/commit/5511aa55c27bf84ce67dadcbeeb1507934a4ec17))
* 加上插件语言包支持 ([ff4b516](https://github.com/meadmin-cn/midway-meamdin/commit/ff4b5169b16b308abbbfd9f76fd4da93acfb195e))
* 加上超管不允许设置 ([0c770b3](https://github.com/meadmin-cn/midway-meamdin/commit/0c770b3370fc03ab094cfba1abe2c59e0a4fddfe))
* 加上创建者和最后更新者关联查询 ([8b142e3](https://github.com/meadmin-cn/midway-meamdin/commit/8b142e3c17239eeebb3b455371127914e8d79a6b))
* 加上登录和注册样式 ([fc9064a](https://github.com/meadmin-cn/midway-meamdin/commit/fc9064a80ec642a2f142d67559c60e45c93a254a))
* 加上登录验证码接口校验 ([3aad7da](https://github.com/meadmin-cn/midway-meamdin/commit/3aad7da89e39be693329ab235dd9fc3caee85509))
* 加上管理员表 ([116ae57](https://github.com/meadmin-cn/midway-meamdin/commit/116ae57276f0a54918bac5dd34e909f095e40dda))
* 加上管理员详情，优化字典获取 ([bf9e523](https://github.com/meadmin-cn/midway-meamdin/commit/bf9e52344bcdfab6f10e19914cda18821fe69eeb))
* 加上后台权限校验支持 ([968974d](https://github.com/meadmin-cn/midway-meamdin/commit/968974d67c48ff3105e2d4df6038f41f105dde80))
* 加上路由组级递归path生成 ([cc103d5](https://github.com/meadmin-cn/midway-meamdin/commit/cc103d51ffd68f328ed549884cfd78a660000a53))
* 加上前端用户中心和修复前台服务端渲染cookie获取bug ([3d45727](https://github.com/meadmin-cn/midway-meamdin/commit/3d4572762cf9e792ed3065587c50c554f1edf871))
* 加上前台用户的管理页面 ([83365ac](https://github.com/meadmin-cn/midway-meamdin/commit/83365ac303e275f32aa530ead4d264ff44e5096d))
* 加上示例实体 ([6df1add](https://github.com/meadmin-cn/midway-meamdin/commit/6df1add97217ab5b05295db17f774e158b397627))
* 加上自定义校验规则 ([344b966](https://github.com/meadmin-cn/midway-meamdin/commit/344b966b34199d6f3006f2dd28ca5bfab51b0efd))
* 加上自定义组件 ([f309532](https://github.com/meadmin-cn/midway-meamdin/commit/f30953215b5216af80fea679de09c62d6ee72d13))
* 加上自动设置created_admin_id、updated_admin_id优化软批量删除 ([b10d0e0](https://github.com/meadmin-cn/midway-meamdin/commit/b10d0e003b8c703c1dcb9c9d0b882c6a2f363e95))
* 加上组件异步支持 ([b5d8e19](https://github.com/meadmin-cn/midway-meamdin/commit/b5d8e19dbc41b901891e971f9678a3cd3ac083c4))
* 加上api和验证示例 ([2fee50f](https://github.com/meadmin-cn/midway-meamdin/commit/2fee50fd37f4fa9c0d435650826228428e7557c2))
* 加上env环境变量自动加载 ([bbf5a85](https://github.com/meadmin-cn/midway-meamdin/commit/bbf5a85a9882324ab16e0abd8c5f046f752d7190))
* 加上menu左右边界配置 ([8b85b8f](https://github.com/meadmin-cn/midway-meamdin/commit/8b85b8f0fb90093804f463455968e81c970f1281))
* 加上sqllize数据库 ([412b45b](https://github.com/meadmin-cn/midway-meamdin/commit/412b45bdc8d4a45b2b4199d38768d78d9342c308))
* 加上swagger ([b81c27d](https://github.com/meadmin-cn/midway-meamdin/commit/b81c27d8c29558cd2a80a9f0ec14c4f4b23f4736))
* 加上swagger property及rule整合装饰器 ([fd152a1](https://github.com/meadmin-cn/midway-meamdin/commit/fd152a104c6bc5dc1dae6560339a796d05844236))
* 加上swagger返回声明装饰器：ApiOperationResponse ([60847da](https://github.com/meadmin-cn/midway-meamdin/commit/60847daf06785db3722c5873783d3e4ba37e25f7))
* 前台服务端渲染调通 ([5d61510](https://github.com/meadmin-cn/midway-meamdin/commit/5d615103fbff3b31ec69983060b09ca905c8fa56))
* 前台页面服务端渲染 ([623d3b3](https://github.com/meadmin-cn/midway-meamdin/commit/623d3b3345f3508c3102cb9ab9caa8516c6f69a7))
* 软删除的唯一索引设置为局部索引，优化实体类继承 ([daa3b33](https://github.com/meadmin-cn/midway-meamdin/commit/daa3b338fcc229993423c67916a362c9bd6f30d1))
* 升级前端的eslint版本及校验 ([2fa8eb1](https://github.com/meadmin-cn/midway-meamdin/commit/2fa8eb17a888e675f1a8fbedf5f8c28a36b3335b))
* 升级midway版本为3.16.6 ([b1e0fc5](https://github.com/meadmin-cn/midway-meamdin/commit/b1e0fc5402285325264a45c2dfe37616bc75d4f3))
* 完善语言包 ([fc8b838](https://github.com/meadmin-cn/midway-meamdin/commit/fc8b8384f9f95134c2829bf53e89a80ac3f11062))
* 完善dto类型声明 ([458dbfa](https://github.com/meadmin-cn/midway-meamdin/commit/458dbfae4481862ee322af8cddc92046ff56b89d))
* 网站名称从配置中读取 ([10c5d08](https://github.com/meadmin-cn/midway-meamdin/commit/10c5d089ad448e13c571720657acd1091d4030f1))
* 文件上传加上文件选择 ([bd21ced](https://github.com/meadmin-cn/midway-meamdin/commit/bd21cedc730d400c42fe05dba79417f9f9f534b0))
* 文件上传完成，支持秒传、断点续传、分片上传;分页size参数改完pageSize ([3e5524a](https://github.com/meadmin-cn/midway-meamdin/commit/3e5524af07cca9a97bf01d21b6806b0fc74252b7))
* 系统设置/管理员管理完成 ([3c442b8](https://github.com/meadmin-cn/midway-meamdin/commit/3c442b8ff90dc8f33bee21887a2281150bcc137f))
* 异常时日志记录 ([aaa795c](https://github.com/meadmin-cn/midway-meamdin/commit/aaa795c2909bddd299e76c9a0813652539ddc1ff))
* 优化详情和新增修改功能 ([ffe90dd](https://github.com/meadmin-cn/midway-meamdin/commit/ffe90dd8bc625df1042df5a65793324b6fcc7383))
* 增加数据库日志打印 ([395847c](https://github.com/meadmin-cn/midway-meamdin/commit/395847c0ba1786c8d5c281d54928f840e6c47644))
* 增删改查完成 ([7287e0e](https://github.com/meadmin-cn/midway-meamdin/commit/7287e0e5869d3fb90f1c27c4262d3ee84cb80d81))
* 增删改查完善，需要修复 ([1f0f8ab](https://github.com/meadmin-cn/midway-meamdin/commit/1f0f8ab4ecaa833dffaff7770f35e94379cb4b8c))
* 自动生成加上文件关联支持 ([2e9ce52](https://github.com/meadmin-cn/midway-meamdin/commit/2e9ce528dfef4b4b264f57638f9d83fd299a0cd3))
* 自动生成详情支持 ([f514489](https://github.com/meadmin-cn/midway-meamdin/commit/f51448988fc636e7a5615a740d3922ddf5eae3d3))
* 组件语言包加载改为通过异步组件实现 ([09c30a8](https://github.com/meadmin-cn/midway-meamdin/commit/09c30a8f974d68dc7908aae9ab3fab0e907b7ba7))
* **aon-doc:** 插件模板更新 ([c71d613](https://github.com/meadmin-cn/midway-meamdin/commit/c71d6132a9b9f52694cdc4791db47f4342705733))
* **aon-doc:** 插件展示优化 ([202d9b4](https://github.com/meadmin-cn/midway-meamdin/commit/202d9b43c3ec804db416da5f31effe0e9ac2cc47))
* **aon-doc:** 完善安装命令及删除命令 ([78cc491](https://github.com/meadmin-cn/midway-meamdin/commit/78cc4914b3a2a8a329d8ba0d63a2abdddd418ddb))
* **aon-doc:** 优化展示及内容切换 ([7ef0873](https://github.com/meadmin-cn/midway-meamdin/commit/7ef08738e3132acb5794df7a18216f0349757a55))
* **aon-doc:** doc插件初步完成 ([d8d1110](https://github.com/meadmin-cn/midway-meamdin/commit/d8d111077c99da607fa10ece37ab42f30a28e7a1))
* **cli:** 插件命令完成 ([5ea7c56](https://github.com/meadmin-cn/midway-meamdin/commit/5ea7c56a5a3bd2107758f445a5dd1cdc7ad0d575))
* **cli:** 优化sync数据库同步命令，改完按实体名称同步 ([30d5751](https://github.com/meadmin-cn/midway-meamdin/commit/30d5751df3613733dee6592fc08a801a77712385))
* **core:** 加上app全局变量 ([5663f9c](https://github.com/meadmin-cn/midway-meamdin/commit/5663f9c166f9644043f185a1099dc2449a198934))
* **create-meadmin:** 加上批量设置版本功能 ([d99b775](https://github.com/meadmin-cn/midway-meamdin/commit/d99b77526110cd8939772fbfcf45526f6c6c20de))
* **create-meadmin:** 优化创建模板去除插件内容 ([4a1ff6d](https://github.com/meadmin-cn/midway-meamdin/commit/4a1ff6d2b7d33c3161b762eb52637c99389c0e6a))
* crud:del加上coverage支持;自动排除自动生成字段;移除html模板转义 ([1343047](https://github.com/meadmin-cn/midway-meamdin/commit/134304731e87321f0fbdab66712b5aa24f7116d7))
* crud加上可自行设置生成内容 ([986aad3](https://github.com/meadmin-cn/midway-meamdin/commit/986aad3802faf88dc5afb47e385d8efbcfe041db))
* crud生成后端代码加上关联模型支持 ([a36f06d](https://github.com/meadmin-cn/midway-meamdin/commit/a36f06dc46733eba5e6f1e4365b3fa0a93f59ee2))
* database配置拆分 ([0b951ec](https://github.com/meadmin-cn/midway-meamdin/commit/0b951eca3f92564ab4f4f076f4daf347befd1cfe))
* doc差距前台页面展示 ([28b7945](https://github.com/meadmin-cn/midway-meamdin/commit/28b794505d93c1dbb0872e2516983ab9840afded))
* feat：crud接口生成 ([3126471](https://github.com/meadmin-cn/midway-meamdin/commit/3126471ef8b514c7565f1725cafe8b5010a14907))
* **meadmin:** 管理员头像上传，改为存储文件id ([f926c11](https://github.com/meadmin-cn/midway-meamdin/commit/f926c117543ce2e2b2328f7727beeadb826783b9))
* **meadmin:** 后台admin访问前缀，提到配置中 ([7e06b44](https://github.com/meadmin-cn/midway-meamdin/commit/7e06b44972749ec4b4c0e4345aa651650183106c))
* **meadmin:** 加上事务装饰器，后台登录加上事务和设置登录ip ([c67c9cb](https://github.com/meadmin-cn/midway-meamdin/commit/c67c9cb50c24889ea723e48c1734076dea0246ab))
* **meadmin:** 前台登录注册调通 ([d8f128e](https://github.com/meadmin-cn/midway-meamdin/commit/d8f128eb794264f5f4bc447f654142c31918d287))
* **meadmin:** 前台接口请求支持服务端渲染 ([fa64098](https://github.com/meadmin-cn/midway-meamdin/commit/fa64098cea8a029bece5e6e9a7b83a72b9d9e368))
* **meadmin:** 网站标题设置到env文件中 ([9505e6a](https://github.com/meadmin-cn/midway-meamdin/commit/9505e6aa141079caaf3b61e0e9af1064f03ff778))
* medailog高度、宽度加0.5防止出现多余滚动条 ([6d494c4](https://github.com/meadmin-cn/midway-meamdin/commit/6d494c48da6e7d9995e921ee8a2fcfadba2e3115))
* **midway-vite-view:** 打包命令加上env支持 ([1d3a54f](https://github.com/meadmin-cn/midway-meamdin/commit/1d3a54f206232081441c9395c9703ae884e798f0))
* **midway-vite-view:** 服务端渲染调用加上request、cookie到context ([c3d37c0](https://github.com/meadmin-cn/midway-meamdin/commit/c3d37c0221179c5cc8bbef02c728f9ed7341892c))
* swagger加上 PickDtoType 和 OmitDtoType ([5f06293](https://github.com/meadmin-cn/midway-meamdin/commit/5f06293b1843a5a478576e2d5dd810f06e292bec))


### Bug 修复[fix]

* :art: 修复后台头像不显示bug ([41f399c](https://github.com/meadmin-cn/midway-meamdin/commit/41f399c52af58de66ca192d33b0ce142d703a8ce))
* 菜单和角色更新dto排除自动创建字段 ([0198c3f](https://github.com/meadmin-cn/midway-meamdin/commit/0198c3f9e2d0fb9eb30334a4577f2fdbc917d732))
* 第三包开发监听 ([f01b7b2](https://github.com/meadmin-cn/midway-meamdin/commit/f01b7b23b7ed82631c50b9f92fa945b0f6fdaa34))
* 加上配置说明 ([7aff188](https://github.com/meadmin-cn/midway-meamdin/commit/7aff1889a23be679bdc1518f8886a5023aaf73fc))
* 将types声明及扩展挪到src中并使用点.ts已确保其被ts校验检查 ([995d612](https://github.com/meadmin-cn/midway-meamdin/commit/995d612ba46b69a1855208d4971b06e6e6b2c9fe))
* 角色和菜单新增dto排除自动创建的字段 ([5f619cb](https://github.com/meadmin-cn/midway-meamdin/commit/5f619cb7365b7f0d050154a649555d00bc82da74))
* 去除多余的判断 ([6a40de1](https://github.com/meadmin-cn/midway-meamdin/commit/6a40de15a492127f601db303ae27a45a14c441c4))
* 去除前台页面获取介绍接口权限校验 ([6a8eb53](https://github.com/meadmin-cn/midway-meamdin/commit/6a8eb53c3f61e553ff2967cb0c327ff8e67bbffe))
* 设置版本为1.2.1 ([1dedfbb](https://github.com/meadmin-cn/midway-meamdin/commit/1dedfbb9fc091ec257d2ad6ad8afcf464eed77ea))
* 同步数据库配置时加上acstract类 ([81963e4](https://github.com/meadmin-cn/midway-meamdin/commit/81963e43e5658144cec31d87cf72c7d22dfaabb2))
* 修复 view 加载时机问题(必须两个await,等midway官方优化后再去得) ([10bd37e](https://github.com/meadmin-cn/midway-meamdin/commit/10bd37ec8512089e45185d281f83704efe020109))
* 修复菜单展示错位问题 ([cef64a8](https://github.com/meadmin-cn/midway-meamdin/commit/cef64a841a6e046e5218fe6183b2fd01e0b508f1))
* 修复插件文件生成bug ([afefafa](https://github.com/meadmin-cn/midway-meamdin/commit/afefafa11c3e02f99a9449c0428b0abfcf442893))
* 修复创建错误 ([274d75d](https://github.com/meadmin-cn/midway-meamdin/commit/274d75d71453597f34cfc751257465036e13d6f5))
* 修复创建脚本 ([24ed2d2](https://github.com/meadmin-cn/midway-meamdin/commit/24ed2d2ed1bec06826bfe2c2f52f9e285c54f1e6))
* 修复登录后菜单渲染失败 ([dfa111b](https://github.com/meadmin-cn/midway-meamdin/commit/dfa111b9787503ddbb6eec40da67421c15277da5))
* 修复登录接口初始化错误 ([dcce990](https://github.com/meadmin-cn/midway-meamdin/commit/dcce990aeef6c3ea598ebcb874ee3f92cfbf93d3))
* 修复多个vite客户端启动 热更新端口混乱问题 ([14dded5](https://github.com/meadmin-cn/midway-meamdin/commit/14dded5e4413ec7ee32c7d8ab03b94abe881b022))
* 修复服务端渲染“跨请求状态污染” ([4ee5605](https://github.com/meadmin-cn/midway-meamdin/commit/4ee560502bb3c0d3876f0c4e3cdae75e9f8c5b0e))
* 修复服务端渲染Teleport错误及element水合错误 ([557894d](https://github.com/meadmin-cn/midway-meamdin/commit/557894d8c3417fb6b545289e25be17041db1dd6b))
* 修复后台登陆跳转问题，修复数据库文件读取失败问题 ([61ff976](https://github.com/meadmin-cn/midway-meamdin/commit/61ff9769b1dd6c4c8dda36cfbd1db1cc9c5c80c9))
* 修复模板生成问题 ([fab92e6](https://github.com/meadmin-cn/midway-meamdin/commit/fab92e637895fd0aa5f18dd11e0c108813ea0674))
* 修复前台登录校验错误，登录过期时间前后台设置一致 ([27cb89f](https://github.com/meadmin-cn/midway-meamdin/commit/27cb89f950133068395e8e73a45afed5f21dcac2))
* 修复缺少的dist文件夹导致启动失败问题 ([75bbe90](https://github.com/meadmin-cn/midway-meamdin/commit/75bbe90c481d2ce02d7dbb8c997b2a8b2ccdc533))
* 修复上传图片预览问题 ([5f3e4f0](https://github.com/meadmin-cn/midway-meamdin/commit/5f3e4f0fe48932b5fe2450e26b79267c84ce5988))
* 修复上传文件夹被错误忽略问题 ([59aacfd](https://github.com/meadmin-cn/midway-meamdin/commit/59aacfd2c27e6cf488f6fd7a019c19e57b04fa3e))
* 修复实体类继承导致的循环引用问题 ([2cc701e](https://github.com/meadmin-cn/midway-meamdin/commit/2cc701e8a223dd975af6f79dd1d8d42f9f04c4f8))
* 修复文件不返回问题 ([9da1069](https://github.com/meadmin-cn/midway-meamdin/commit/9da1069601b568c9f809dcf78fc6e22060e03e54))
* 修复文件查看接口下载问题 ([e9eb7ff](https://github.com/meadmin-cn/midway-meamdin/commit/e9eb7ff89bfe1dda167360b20f6d98e949b06a0b))
* 修复文件上传未保存文件bug ([ecdd0df](https://github.com/meadmin-cn/midway-meamdin/commit/ecdd0df7a0a34de18597d7d1598ba633926f0c54))
* 修复文件上传组件 透传属性更新不触发DOM更新bug ([d4476cd](https://github.com/meadmin-cn/midway-meamdin/commit/d4476cdb5fd5ae6e95ede338c63c81bf792d9cd2))
* 修复无swagger属性报错和继承自model文件参数验证转换报错问题 ([491c38b](https://github.com/meadmin-cn/midway-meamdin/commit/491c38b0b2199d79791afff9eb0288b6f17b3948))
* 修复admin属性排除 ([32bcc81](https://github.com/meadmin-cn/midway-meamdin/commit/32bcc81b1e73da8d81a9c09b9643380425376d72))
* 修复api校验提示转义问题，优化非必填项非空校验判断 ([70b6ce4](https://github.com/meadmin-cn/midway-meamdin/commit/70b6ce49210b3faecfe5a4b1c15f0129cba7031a))
* 修复context全局请求域影响错误 ([978d265](https://github.com/meadmin-cn/midway-meamdin/commit/978d265696ee66603da944f51b15adf17e1c61d8))
* 修复devtoolsJson 展示bug ([e86a2bd](https://github.com/meadmin-cn/midway-meamdin/commit/e86a2bdba7244660ae1d19126215974697b1ca74))
* 修复env多环境加载内容 ([444476b](https://github.com/meadmin-cn/midway-meamdin/commit/444476bc3a88a20b4ff9369e1e610130046cfea8))
* 修复index模板引入顺序错误，修复eslint目录错误，省级自动创建包版本 ([c5ae907](https://github.com/meadmin-cn/midway-meamdin/commit/c5ae907ae5c73371572c6fc386440d7f0801dabb))
* 修复tablead方法错误bug，修改外链 ([b3de79a](https://github.com/meadmin-cn/midway-meamdin/commit/b3de79ac5b2eadf1ee4b9fadacc50ae9d5d1eba5))
* 修复view 渲染时机问题 ([c3f14a7](https://github.com/meadmin-cn/midway-meamdin/commit/c3f14a7b2f474d585043065ff5c1be1a5755765e))
* 优化meComponent组合异步组件调用逻辑 ([ad353c3](https://github.com/meadmin-cn/midway-meamdin/commit/ad353c3c04b3661bc7b40a3fcb5a3bb53984e322))
* 字典和详情调通 ([1b6e5cd](https://github.com/meadmin-cn/midway-meamdin/commit/1b6e5cdcc6cc3a1dce4b7489df2ab9010b21ed41))
* 最大化最小化设置初始宽高设置非写死像素 ([20f0738](https://github.com/meadmin-cn/midway-meamdin/commit/20f0738e92d78c75ed4a813b0d4f4d2ffbeb6885))
* **aon-doc:** 修复卸载sql ([5dd321e](https://github.com/meadmin-cn/midway-meamdin/commit/5dd321e38a5d8efe326d56886506ea861b71ec02))
* **cli:** 插件生成优化 ([d07382e](https://github.com/meadmin-cn/midway-meamdin/commit/d07382e263c5b4ab1908b671d3404cc3f1ab9bb8))
* **cli:** 修复sync命令 解析多文件间隔符错误 ([d3468ab](https://github.com/meadmin-cn/midway-meamdin/commit/d3468ab3c050c9fbf839fd64890a7c0e1f276576))
* **create-meadmin:** 修复模板文件缺少.npmrc文件错误 ([701c50c](https://github.com/meadmin-cn/midway-meamdin/commit/701c50c00e9f502c20f4fa42f3b3541f459ad21b))
* **create-meadmin:** 优化提示语，重新生成template ([bee7a15](https://github.com/meadmin-cn/midway-meamdin/commit/bee7a15ef700e8d3abb0449e4a716fb811cc8609))
* doc插件修复配置页面错误bug ([cf19947](https://github.com/meadmin-cn/midway-meamdin/commit/cf199479ee9e660c8a87606134154b78c8e7fe03))
* **index:** 修复服务端渲染二次刷新路由样式错位bug ([2f9ccfe](https://github.com/meadmin-cn/midway-meamdin/commit/2f9ccfee65efda4a409f0d3b905496a6780350e3))
* **index:** 修复服务端渲染seralize 错误 ([ac05bcf](https://github.com/meadmin-cn/midway-meamdin/commit/ac05bcff8dcca233be8527c2c03561bf41aa8168))
* **index:** 修复加载问题,vue引入必须在element-plus之前，移除多余的组件 ([791f1bc](https://github.com/meadmin-cn/midway-meamdin/commit/791f1bc8768af6be9bfdf3d97d51e68e7428662a))
* **index:** 修复前台文件上传错误问题 ([68b25be](https://github.com/meadmin-cn/midway-meamdin/commit/68b25be9109a413c07a82cac06141eb5eadb8513))
* **meadmin-view-admin:** 修复meButton loading错误 ([fdd0f7e](https://github.com/meadmin-cn/midway-meamdin/commit/fdd0f7e33822fc147b823e1493d908505ae6d61c))
* **meadmin、cli:** 修复权限错误，修复crud生成权限字符错误，crud加上插件生成支持，修复prettierrc配置 ([a33a388](https://github.com/meadmin-cn/midway-meamdin/commit/a33a3887c3cec50557a15985f290a50b24d360d2))
* **meadmin:** 更新meadmin.sql文件，修复types文件位置错误 ([f3c8ce8](https://github.com/meadmin-cn/midway-meamdin/commit/f3c8ce8b1ad3ef143aca80c1c7a5fc6ef59c59a5))
* **meadmin:** 升级midway/i18n到3.20.7 ([b3222b1](https://github.com/meadmin-cn/midway-meamdin/commit/b3222b1f870f4b3c8a0ab6b722263c23295d0d8b))
* **meadmin:** 修复弹窗滚动条不出现bug ([957a95f](https://github.com/meadmin-cn/midway-meamdin/commit/957a95f0e3a62cb2291166af6fc80506ddb975f7))
* **meadmin:** 优化后端i18n，增加前端入参控制语言 ([8a96b76](https://github.com/meadmin-cn/midway-meamdin/commit/8a96b76dd66aee5b90c0088c0406b8d5a51ff003))
* meButton类型声明错误修复 ([59d9620](https://github.com/meadmin-cn/midway-meamdin/commit/59d9620a0719311be022817c5396350ba9d51546))
* menuItem改为全局组件 ([7e02cf2](https://github.com/meadmin-cn/midway-meamdin/commit/7e02cf28066ae27d54fb5d1f4129155080324d24))
* meVxeTable组件修复loading ([6974916](https://github.com/meadmin-cn/midway-meamdin/commit/6974916a3cb55a2cd63e2f31cb3df62b7816b8e6))
* **midway-vite-view:** 升级view依赖到3.20.17 ([ed658b6](https://github.com/meadmin-cn/midway-meamdin/commit/ed658b6426a6f345c0bc1eeaf2840649e6c41448))
* **midway-vite-view:** 修复缺少dist文件夹导致启动失败问题 ([fcbb09e](https://github.com/meadmin-cn/midway-meamdin/commit/fcbb09e4c52a8599d6a35d486a7c56e47091e5cd))
* swagger 类引用改为函数延迟引用 防止时机问题 ([6da6150](https://github.com/meadmin-cn/midway-meamdin/commit/6da61500f0b024163f7c95da41505152523cefcd))
* typescript的preserveSymlinks设置为false确保和pnpm符号链接兼容 ([82a5b50](https://github.com/meadmin-cn/midway-meamdin/commit/82a5b505d4d343a4a0f2ecf4f8c4ba653a7c2f20))


### 其他[chore]

* 版本号改为1.0.2 ([73a92d9](https://github.com/meadmin-cn/midway-meamdin/commit/73a92d95aafd671e30cc9b529b6f7773bfc80407))
* 版本号改为1.1.0 ([a5d3fc2](https://github.com/meadmin-cn/midway-meamdin/commit/a5d3fc2ae7d00f9aaffe4a35cfff71bf7e00fb12))
* 版本升级 ([26015f6](https://github.com/meadmin-cn/midway-meamdin/commit/26015f61a97b09848c5f1dce53a01ccdeaeb600e))
* 初始化模板 ([d8d7181](https://github.com/meadmin-cn/midway-meamdin/commit/d8d7181ed97b6dc0577c16857f345d278d337611))
* 更新对等依赖peerDependencies版本控制 ([59e4bac](https://github.com/meadmin-cn/midway-meamdin/commit/59e4baca9ef61f41dde214f2d388eb08d03887e0))
* 还原版本号 ([51a8946](https://github.com/meadmin-cn/midway-meamdin/commit/51a8946dfcc1d867f402cbc6c4cedd3c744039c9))
* 加上代码发布和git提交规范 ([0d8372f](https://github.com/meadmin-cn/midway-meamdin/commit/0d8372f1856ca092f4ad63053b0f9260595df904))
* 临时存储 ([891321a](https://github.com/meadmin-cn/midway-meamdin/commit/891321aae605ae77215baef4b8b809ba6510ec5b))
* 删除多余的测试文件 ([12f8843](https://github.com/meadmin-cn/midway-meamdin/commit/12f8843059e5d06809b14d8034812fa4ca2be6b4))
* 删除多余的错误文件 ([4c78bbd](https://github.com/meadmin-cn/midway-meamdin/commit/4c78bbd914b5fe97b9c0ade30ebad281ae9ff7b5))
* 升级vue和element-plus版本 ([252b007](https://github.com/meadmin-cn/midway-meamdin/commit/252b007456f23bf7d54715eb0d62c5576153e86d))
* 升级vxe-table^4.17.2、unplugin-auto-import^20.2.0、unplugin-vue-components^30.0.0 ([79d045a](https://github.com/meadmin-cn/midway-meamdin/commit/79d045a85e8ba2e27e3265e5bf292ced38a4f399))
* **core:** 删除多余的引用 ([ee8e89b](https://github.com/meadmin-cn/midway-meamdin/commit/ee8e89b5527f72f8577cc4f58c9583aeeee800c0))
* **meadmin:** :art: seqlize省级到7.0.0-alpha.47 ([f2f3a55](https://github.com/meadmin-cn/midway-meamdin/commit/f2f3a55b2a75b9f46490ceec0e9a0fcaafe80e1c))
* **meadmin:** 加上vscode推荐扩展 ([c8b91b9](https://github.com/meadmin-cn/midway-meamdin/commit/c8b91b99fdb28fa1c19852d30eb2c9b94eb8f508))
* midway升级到3.20.19 ([b59b0af](https://github.com/meadmin-cn/midway-meamdin/commit/b59b0af02a1b054e70e5076d85abd45aaac8b7e2))
* prettier升级为3.8.1, 样式设置为在一行，不换行 ([5354a9a](https://github.com/meadmin-cn/midway-meamdin/commit/5354a9a1544aaac5ca7fbce089998759b6c49641))
* release v1.0.2 ([8ee8156](https://github.com/meadmin-cn/midway-meamdin/commit/8ee81563c5a5e56672087bfcc0ea00617710e6af))
* release v1.1.0 ([e9a3b40](https://github.com/meadmin-cn/midway-meamdin/commit/e9a3b403f389b600cd4522f69b4362895e8914b1))


### 文档更改[docs]

* 包作者声明 ([a1d2b0a](https://github.com/meadmin-cn/midway-meamdin/commit/a1d2b0a30219bc16e90467b6f39409a1bd06d7d9))
* 错别字更改 ([2eb4016](https://github.com/meadmin-cn/midway-meamdin/commit/2eb4016cd767909813617dc65b34dbd7ca8ecb37))
* 加上说明文件 ([12b24bd](https://github.com/meadmin-cn/midway-meamdin/commit/12b24bd86a63016a2a5aaeab8ae20b2e17733ac9))
* 介绍语更改 ([453371a](https://github.com/meadmin-cn/midway-meamdin/commit/453371a7febbed42404d2f8901f44736353df099))
* 提示语更改 ([a1e5da7](https://github.com/meadmin-cn/midway-meamdin/commit/a1e5da7cbea601b4dbd07cc2fd0482788ec44b99))
* 文档更改 ([aada0d9](https://github.com/meadmin-cn/midway-meamdin/commit/aada0d9da022777a3b733e90dbbc39debe7b8b62))
* 修改说明文件 ([0e0771a](https://github.com/meadmin-cn/midway-meamdin/commit/0e0771a64d2956d7fbb11cfdfdfb0acfe0ba6849))
* 修改说明文件 ([b1fbb63](https://github.com/meadmin-cn/midway-meamdin/commit/b1fbb63ec1b1984e431a238a22e66df87531039f))
* **midway-vite-view:** 修改包版本和说明 ([c3df07f](https://github.com/meadmin-cn/midway-meamdin/commit/c3df07ff8d1c63bdc607e71e3bea91955e253b83))


### 样式更改[style]

* 格式化 ([42b42e4](https://github.com/meadmin-cn/midway-meamdin/commit/42b42e40c6ae2355fa95f22ace2fc763eaff09d9))
* 格式化 ([eb76de2](https://github.com/meadmin-cn/midway-meamdin/commit/eb76de2ab9dcc0c3547600b9f649ca22c152c18d))
* 格式化配置调整 ([680e82a](https://github.com/meadmin-cn/midway-meamdin/commit/680e82a052a89ec91a6927a0298298a8ec2f04c3))
* 加上vscode配置 ([04ea179](https://github.com/meadmin-cn/midway-meamdin/commit/04ea17975a34b8db2541cdfa746eda0d44725a6b))
* **cli:** 修复生成模板的格式问题 ([d4ff851](https://github.com/meadmin-cn/midway-meamdin/commit/d4ff85164e50801afda28d1d74d422b7fe0b2b17))


### 重构[refactor]

* 包名更改 ([8d1f17a](https://github.com/meadmin-cn/midway-meamdin/commit/8d1f17aa2922a8befbbaf444a38d7d94bc841966))
* 包名更改 ([60e35a4](https://github.com/meadmin-cn/midway-meamdin/commit/60e35a4cf156948b68acfd970abf77ce0903de71))
* 格式化文件 ([2d79653](https://github.com/meadmin-cn/midway-meamdin/commit/2d796539a9757abfb86c10980e6067d280d34c1e))
* 加上ssr兼容代码转换(admin仅支持客户端渲染) ([15767ed](https://github.com/meadmin-cn/midway-meamdin/commit/15767ed73fc172032f3f2bed672343fd9c570772))
* 修改内容说明 ([1c410aa](https://github.com/meadmin-cn/midway-meamdin/commit/1c410aac07423275e1295b709529cb3dd44d48b7))
* 移除prod配置 ([6e48159](https://github.com/meadmin-cn/midway-meamdin/commit/6e48159e9c1bbe705fb5a8657a10b72380ee9574))
* 优化详情 展示及api调用方式，加上权限 ([76d6634](https://github.com/meadmin-cn/midway-meamdin/commit/76d66347d7c008360d6fb2c85dde4439ab60c239))
* 优化commitlint规则读取 ([1755ee3](https://github.com/meadmin-cn/midway-meamdin/commit/1755ee3d5d1589aee6716c286b55f6dbce91f965))
* 优化meButton写法 ([5f3df16](https://github.com/meadmin-cn/midway-meamdin/commit/5f3df1694d3bfb2016c2e1781f71ca4a320cb141))
* **meadmin-view-admin:** 移除多余的告警和代码 ([7e467fd](https://github.com/meadmin-cn/midway-meamdin/commit/7e467fd64f2d666289de8c2620da9db46ff1d32b))
* **meadmin:** 文件上传改为stronge可扩展形式 ([a630617](https://github.com/meadmin-cn/midway-meamdin/commit/a630617fb96cd8f68a0fb13f9d1a338e51d6f630))
* **meadmin:** 文件上传挪到file扩展文件中 ([17211b1](https://github.com/meadmin-cn/midway-meamdin/commit/17211b12eb18e0ecba882a335eedd633b0c6db28))
* meButton重新封装 ([55782de](https://github.com/meadmin-cn/midway-meamdin/commit/55782de4db2cbd7e36f8c5f7c3cced8463fe45fb))
* vscode配置自动移除引用 ([c605d5a](https://github.com/meadmin-cn/midway-meamdin/commit/c605d5a2f01e96e5829a9e74cee30abe94eb005c))


### 性能改进[perf]

* 取消数据库外键，转为逻辑层 ([af35aff](https://github.com/meadmin-cn/midway-meamdin/commit/af35affca0777927e2d3cf643746086c918c4159))
* 取消数据库外键，转为逻辑层 ([89ebd06](https://github.com/meadmin-cn/midway-meamdin/commit/89ebd06fc7f41bb399f1515c7040dd3eb8d21b4e))
* 依赖版本升级 ([2d81d1f](https://github.com/meadmin-cn/midway-meamdin/commit/2d81d1fc2c3d68b06c6949c68227e86f54598315))
* 移除多余的加载配置 ([ce9578f](https://github.com/meadmin-cn/midway-meamdin/commit/ce9578f57e73cc5aa53b58619274bf37e4a1a76d))
* **meadmin:** 页面渲染去除多余的await ([ab4dcfc](https://github.com/meadmin-cn/midway-meamdin/commit/ab4dcfc250f342ef5ec3a26c23a9a948aff25b45))
* midway-vite-view重写，优化api更新后，自动重启vite服务 ([ef60cb6](https://github.com/meadmin-cn/midway-meamdin/commit/ef60cb604b796368b0f00f37d04c6235b5024519))
* pnpm:autoInstallPeers:false;view-admin设置ts-node为nodenext；vite-plugin-compression替换为2 ([a36d359](https://github.com/meadmin-cn/midway-meamdin/commit/a36d359896cebdaa2c2bdc8576b3d9a2b6962d37))


### CI发版[ci]

* 版本更新 ([64efcc3](https://github.com/meadmin-cn/midway-meamdin/commit/64efcc3dc8815d41ff328663d9c9636964823d4a))
* 调试命令加上，清空目标文件夹 ([8a93fee](https://github.com/meadmin-cn/midway-meamdin/commit/8a93fee5887dc6093d9b6db328212e649739e912))
* 更新模板版本号 ([39e6835](https://github.com/meadmin-cn/midway-meamdin/commit/39e68352abc10f64027284e008013fe89299cef5))
* **create-meadmin:** 重新生成模板文件 ([7baa858](https://github.com/meadmin-cn/midway-meamdin/commit/7baa85892a4ebdce26c7bf00f74e7d6fd73e4398))

## [1.1.0](https://github.com/meadmin-cn/midway-meamdin/compare/main-1.0.2...main-1.1.0) (2026-02-12)


### Bug 修复[fix]

* **cli:** 修复sync命令 解析多文件间隔符错误 ([3460111](https://github.com/meadmin-cn/midway-meamdin/commit/3460111ebf22f7c0a3c80939baf43934dfe847ce))
* **create-meadmin:** 修复模板文件缺少.npmrc文件错误 ([9d8a853](https://github.com/meadmin-cn/midway-meamdin/commit/9d8a853aac2e6ea59707c991386a58d92bcdca2b))
* **meadmin:** 更新meadmin.sql文件，修复types文件位置错误 ([b180c1c](https://github.com/meadmin-cn/midway-meamdin/commit/b180c1c78d6dd2db6c08fcc53543cef476bf8c95))
* **midway-vite-view:** 修复缺少dist文件夹导致启动失败问题 ([52151b0](https://github.com/meadmin-cn/midway-meamdin/commit/52151b0326d51c5074907286c82274c943379f34))


### 其他[chore]

* 版本号改为1.1.0 ([4f24492](https://github.com/meadmin-cn/midway-meamdin/commit/4f24492ae991d091fce15a5e223c9f68536c465d))


### CI发版[ci]

* **create-meadmin:** 重新生成模板文件 ([0ce1320](https://github.com/meadmin-cn/midway-meamdin/commit/0ce132045f277c74811d9a1fbdc3b4abee16cdb8))

## 1.0.2 (2026-02-11)


### 新功能[feat]

* 初始化 ([0ffc4f6](https://github.com/meadmin-cn/midway-meamdin/commit/0ffc4f6737e408c1ef4fa6d7ef74f4ab43d71abe))
* 调通后台登录 ([c5b575b](https://github.com/meadmin-cn/midway-meamdin/commit/c5b575b13b9d86fa42812411711e81bfd8bdef40))
* 调整entity格式和配置 ([f2fe4d3](https://github.com/meadmin-cn/midway-meamdin/commit/f2fe4d34559c2b276df601b50adef406807882d8))
* 格式化prettierrc加上import插件 ([f052e33](https://github.com/meadmin-cn/midway-meamdin/commit/f052e33438f3ae3e39947ef7b90d39032a512987))
* 关联模型的新增和编辑自动生成完成 ([39a43f2](https://github.com/meadmin-cn/midway-meamdin/commit/39a43f22d8b7e62d9f2f0b4b8e4af8ea2d317413))
* 管理后台默认跳转第一个动态路由 ([be34594](https://github.com/meadmin-cn/midway-meamdin/commit/be34594c2ab802a18cbbf85c7db1f59d9e3f0b3c))
* 集成meadmin-template(客户端渲染) ([535dc5f](https://github.com/meadmin-cn/midway-meamdin/commit/535dc5fecd8596356e33c64a78a384ed71fd5792))
* 加上-m --module 参数设置env环境变量 ([03ec837](https://github.com/meadmin-cn/midway-meamdin/commit/03ec837d2c365dd34ad805c44ef52d1ece212192))
* 加上@meadmin/cli，并建立sync数据表同步命令 ([d40a495](https://github.com/meadmin-cn/midway-meamdin/commit/d40a49522a737f4263c8b8177ff493f206d243c5))
* 加上超管不允许设置 ([4da0f6e](https://github.com/meadmin-cn/midway-meamdin/commit/4da0f6ec8a5f4e158aa20f992e55d9e01b37205e))
* 加上创建者和最后更新者关联查询 ([4ceb719](https://github.com/meadmin-cn/midway-meamdin/commit/4ceb719436ab971599b18d2f98ecc86342c6f035))
* 加上登录和注册样式 ([91faf49](https://github.com/meadmin-cn/midway-meamdin/commit/91faf4949626daff30400efa437d59c604d1b75b))
* 加上登录验证码接口校验 ([6d67eee](https://github.com/meadmin-cn/midway-meamdin/commit/6d67eee61cdb70878b606bca9be0381bfe73ade0))
* 加上管理员表 ([9c14946](https://github.com/meadmin-cn/midway-meamdin/commit/9c1494698b8602363539dafcc6a5bfae9a37ec91))
* 加上管理员详情，优化字典获取 ([7943916](https://github.com/meadmin-cn/midway-meamdin/commit/7943916dc8685a0e5f568671ebcb86d74e1b026b))
* 加上后台权限校验支持 ([1ab5fb5](https://github.com/meadmin-cn/midway-meamdin/commit/1ab5fb5ffc0bcf1ab75dea861c4bdbb84dd5e81e))
* 加上路由组级递归path生成 ([85b703d](https://github.com/meadmin-cn/midway-meamdin/commit/85b703dd87db8fdd03d8b57104d4e0b3680eb88a))
* 加上前端用户中心和修复前台服务端渲染cookie获取bug ([146015f](https://github.com/meadmin-cn/midway-meamdin/commit/146015f782ff76d65a047a38bea534be879b726c))
* 加上前台用户的管理页面 ([0431b5f](https://github.com/meadmin-cn/midway-meamdin/commit/0431b5fc532dc9093a4c9a2858b78d32312ce27d))
* 加上示例实体 ([f587a39](https://github.com/meadmin-cn/midway-meamdin/commit/f587a3988fdbbe07cfe59f73047dd55dc0da4407))
* 加上自定义校验规则 ([f7da926](https://github.com/meadmin-cn/midway-meamdin/commit/f7da926ca2b51e5135538caa4e3c8f3d05a08129))
* 加上自定义组件 ([f309532](https://github.com/meadmin-cn/midway-meamdin/commit/f30953215b5216af80fea679de09c62d6ee72d13))
* 加上自动设置created_admin_id、updated_admin_id优化软批量删除 ([cc397d6](https://github.com/meadmin-cn/midway-meamdin/commit/cc397d6d2ac848b267311e532328d3290c3ff516))
* 加上组件异步支持 ([3841f9f](https://github.com/meadmin-cn/midway-meamdin/commit/3841f9f0f4591fb0821b63cafffdc720cbbe3ecb))
* 加上api和验证示例 ([82b292f](https://github.com/meadmin-cn/midway-meamdin/commit/82b292f879e17f776dd58a33e123d38b1e2ff1ae))
* 加上env环境变量自动加载 ([cdc4e32](https://github.com/meadmin-cn/midway-meamdin/commit/cdc4e32dfa37413a79f6b632ed2421fceef12f09))
* 加上menu左右边界配置 ([fe8daaf](https://github.com/meadmin-cn/midway-meamdin/commit/fe8daaf3a777bd05a1ed215bab466831b7ee47fd))
* 加上sqllize数据库 ([284a8ab](https://github.com/meadmin-cn/midway-meamdin/commit/284a8abeca10d329814791ecacd28c5113051fd6))
* 加上swagger ([00cae3d](https://github.com/meadmin-cn/midway-meamdin/commit/00cae3d32db12711a96e4b11ce4abdd68ee74e01))
* 加上swagger property及rule整合装饰器 ([de6a110](https://github.com/meadmin-cn/midway-meamdin/commit/de6a110d99f5c4f5f9faa241d9c1c6eedecf5046))
* 加上swagger返回声明装饰器：ApiOperationResponse ([8c76703](https://github.com/meadmin-cn/midway-meamdin/commit/8c767037c4189c246dd9e5c5a4f8c1606423bb94))
* 前台服务端渲染调通 ([ca2a2bb](https://github.com/meadmin-cn/midway-meamdin/commit/ca2a2bba373b707a7efdb521bcaa25a657cf7c04))
* 前台页面服务端渲染 ([0f3b598](https://github.com/meadmin-cn/midway-meamdin/commit/0f3b59878ccd1766fbe6a06ce5c2faa863455fb8))
* 软删除的唯一索引设置为局部索引，优化实体类继承 ([d42ffe2](https://github.com/meadmin-cn/midway-meamdin/commit/d42ffe2a8aef2d681499c4e695d76289c2f910bc))
* 升级前端的eslint版本及校验 ([c07479e](https://github.com/meadmin-cn/midway-meamdin/commit/c07479ec0114084a23fd9bb7c5729398fa44cee8))
* 升级midway版本为3.16.6 ([2514948](https://github.com/meadmin-cn/midway-meamdin/commit/2514948b058196efd8f842b56c564383a117bdc1))
* 完善语言包 ([70a6cca](https://github.com/meadmin-cn/midway-meamdin/commit/70a6cca7cf4ecbc7ac0a353d0530e490aca3f8a9))
* 完善dto类型声明 ([317b8b0](https://github.com/meadmin-cn/midway-meamdin/commit/317b8b09507d465aba251d712df7c87fc827e4ba))
* 文件上传加上文件选择 ([5a203be](https://github.com/meadmin-cn/midway-meamdin/commit/5a203beb32b08d5c93421b732890ac9b2da6b0d9))
* 文件上传完成，支持秒传、断点续传、分片上传;分页size参数改完pageSize ([cfad4ed](https://github.com/meadmin-cn/midway-meamdin/commit/cfad4ed875f871791443555b9acb39a37db6cdc6))
* 系统设置/管理员管理完成 ([b74609f](https://github.com/meadmin-cn/midway-meamdin/commit/b74609f4a5f21e8576c89f81fae72dbe1da23dbb))
* 异常时日志记录 ([7911ecf](https://github.com/meadmin-cn/midway-meamdin/commit/7911ecfe9390d86079bc54a7c4710bd2f1b8671f))
* 增加数据库日志打印 ([c88aab2](https://github.com/meadmin-cn/midway-meamdin/commit/c88aab21172bec601af4c20b45dd09173f2b00d5))
* 增删改查完成 ([f4bf9d5](https://github.com/meadmin-cn/midway-meamdin/commit/f4bf9d584bb5c6d7e9d37174e2ff2739546dc258))
* 增删改查完善，需要修复 ([41ca9b9](https://github.com/meadmin-cn/midway-meamdin/commit/41ca9b96f15bb3797a8ee5a8d30d9064538e9ee3))
* 自动生成加上文件关联支持 ([6f02e7f](https://github.com/meadmin-cn/midway-meamdin/commit/6f02e7fc7624d0d80b59009c65da716c1a9c5c8d))
* 自动生成详情支持 ([456c65b](https://github.com/meadmin-cn/midway-meamdin/commit/456c65b17e192f90a9cdadab4fc4881572e51d5d))
* 组件语言包加载改为通过异步组件实现 ([4a62d58](https://github.com/meadmin-cn/midway-meamdin/commit/4a62d58852d2314268b8882f970ee1adbcdcbe9c))
* **core:** 加上app全局变量 ([f3c2d38](https://github.com/meadmin-cn/midway-meamdin/commit/f3c2d3851dbb2b468894914687bcf550aa155d3e))
* crud:del加上coverage支持;自动排除自动生成字段;移除html模板转义 ([3f13648](https://github.com/meadmin-cn/midway-meamdin/commit/3f13648b328d92df524958706bcdc3dfacb5cf66))
* crud加上可自行设置生成内容 ([cb588b0](https://github.com/meadmin-cn/midway-meamdin/commit/cb588b0173c161fa7ce80c2f5018b623548196fd))
* crud生成后端代码加上关联模型支持 ([32352e9](https://github.com/meadmin-cn/midway-meamdin/commit/32352e92fbea411a33d640f5bb97ce8a13ab9efd))
* database配置拆分 ([12390d4](https://github.com/meadmin-cn/midway-meamdin/commit/12390d449b5ec7740d69166e9b62752c111a046a))
* feat：crud接口生成 ([8b3bdfa](https://github.com/meadmin-cn/midway-meamdin/commit/8b3bdfa31eee026b6539ad0adee7e75e1c16eac0))
* **meadmin:** 管理员头像上传，改为存储文件id ([11f6ec2](https://github.com/meadmin-cn/midway-meamdin/commit/11f6ec261d4f27dee1e06e6e9fcc49c7c56a33ca))
* **meadmin:** 后台admin访问前缀，提到配置中 ([232df59](https://github.com/meadmin-cn/midway-meamdin/commit/232df59364ab7328e3d664d1746c0216830fd0e8))
* **meadmin:** 加上事务装饰器，后台登录加上事务和设置登录ip ([9b6a630](https://github.com/meadmin-cn/midway-meamdin/commit/9b6a6302a3b1dc4cad7c89e51da4358738348ccc))
* **meadmin:** 前台登录注册调通 ([e9a3ac2](https://github.com/meadmin-cn/midway-meamdin/commit/e9a3ac2d734228b9b29b7ac6b7f35a1b945b448a))
* **meadmin:** 前台接口请求支持服务端渲染 ([e254832](https://github.com/meadmin-cn/midway-meamdin/commit/e254832aee5c37039c09b152c5844135606d8c98))
* medailog高度、宽度加0.5防止出现多余滚动条 ([dc42601](https://github.com/meadmin-cn/midway-meamdin/commit/dc42601357cd5bb94e75699d501d2f7ada8ccd5c))
* **midway-vite-view:** 打包命令加上env支持 ([5d66f4d](https://github.com/meadmin-cn/midway-meamdin/commit/5d66f4dfbe7e9cd7daee4353730343d3ebfc47ae))
* **midway-vite-view:** 服务端渲染调用加上request、cookie到context ([a5a420d](https://github.com/meadmin-cn/midway-meamdin/commit/a5a420dde18eea2d7b7629b7b406a6849c93e317))
* swagger加上 PickDtoType 和 OmitDtoType ([1c48add](https://github.com/meadmin-cn/midway-meamdin/commit/1c48add190a1783b4791db01ee77a15a56efcd41))


### Bug 修复[fix]

* 菜单和角色更新dto排除自动创建字段 ([ae6126c](https://github.com/meadmin-cn/midway-meamdin/commit/ae6126c89686858b8e2c800d811a539683baa198))
* 第三包开发监听 ([057ce5d](https://github.com/meadmin-cn/midway-meamdin/commit/057ce5d99e2be3c7ee11bb86a627dcf93da2264e))
* 将types声明及扩展挪到src中并使用点.ts已确保其被ts校验检查 ([e912613](https://github.com/meadmin-cn/midway-meamdin/commit/e91261316834fccf144b5c564c383345ff1d00d9))
* 角色和菜单新增dto排除自动创建的字段 ([780b4a7](https://github.com/meadmin-cn/midway-meamdin/commit/780b4a768c7fb8f9f609b6fd04c7dcb8bc5efe80))
* 去除多余的判断 ([f6393e5](https://github.com/meadmin-cn/midway-meamdin/commit/f6393e5712e8403df551c06f00233c7d519e87eb))
* 去除前台页面获取介绍接口权限校验 ([79f2eaa](https://github.com/meadmin-cn/midway-meamdin/commit/79f2eaa1f8ea649d3690148b4bafde1e45cdc24b))
* 同步数据库配置时加上acstract类 ([82038f8](https://github.com/meadmin-cn/midway-meamdin/commit/82038f83cd9e32bbaccddf9dcf6b55d010e3ff7e))
* 修复 view 加载时机问题(必须两个await,等midway官方优化后再去得) ([ead32e5](https://github.com/meadmin-cn/midway-meamdin/commit/ead32e5f30a12de89c2fa332aad56797f5118b11))
* 修复创建错误 ([6dad679](https://github.com/meadmin-cn/midway-meamdin/commit/6dad679d27f77f3100bd2ab904d47807db0c13f4))
* 修复创建脚本 ([cbe6ab5](https://github.com/meadmin-cn/midway-meamdin/commit/cbe6ab5aee864ca3770c48dc3fff1396dadc252e))
* 修复登录后菜单渲染失败 ([a23d037](https://github.com/meadmin-cn/midway-meamdin/commit/a23d037a7ee8788e5b9e5df5109b338b911072de))
* 修复登录接口初始化错误 ([db2dea8](https://github.com/meadmin-cn/midway-meamdin/commit/db2dea8a8fbaf51b837e300f284d7be7455e90d0))
* 修复多个vite客户端启动 热更新端口混乱问题 ([e314a34](https://github.com/meadmin-cn/midway-meamdin/commit/e314a341f4b1069ecb70d74b8df7d134be1334ad))
* 修复服务端渲染“跨请求状态污染” ([e9d85ee](https://github.com/meadmin-cn/midway-meamdin/commit/e9d85ee55906c9241af78f103ff581c84803f933))
* 修复服务端渲染Teleport错误及element水合错误 ([d25f083](https://github.com/meadmin-cn/midway-meamdin/commit/d25f08357fa8244c3717dff41f99d2d5f655acfa))
* 修复后台登陆跳转问题，修复数据库文件读取失败问题 ([d78f92b](https://github.com/meadmin-cn/midway-meamdin/commit/d78f92bf00aa8c602cd74e698d14549e344c6e0e))
* 修复前台登录校验错误，登录过期时间前后台设置一致 ([356a45b](https://github.com/meadmin-cn/midway-meamdin/commit/356a45bbe1a2752cd20f2c18687af9031ede2a74))
* 修复上传图片预览问题 ([c06adb8](https://github.com/meadmin-cn/midway-meamdin/commit/c06adb8aae68f8d86fc489053e96f19a8c8fe804))
* 修复实体类继承导致的循环引用问题 ([306a7c4](https://github.com/meadmin-cn/midway-meamdin/commit/306a7c402adddb06d85f3555b077306a365982ea))
* 修复文件不返回问题 ([a0cda09](https://github.com/meadmin-cn/midway-meamdin/commit/a0cda091f4e95db30e75b69efe9ac033e7cbadfa))
* 修复文件查看接口下载问题 ([cbf242e](https://github.com/meadmin-cn/midway-meamdin/commit/cbf242edd55027b8565d3d9238353ef81227792a))
* 修复文件上传未保存文件bug ([ff22d44](https://github.com/meadmin-cn/midway-meamdin/commit/ff22d440f09795b93dc5d702d3f3659af05a1146))
* 修复无swagger属性报错和继承自model文件参数验证转换报错问题 ([efc164a](https://github.com/meadmin-cn/midway-meamdin/commit/efc164a2bcc7e73b1bdbbb1bac810ccb924f91ec))
* 修复admin属性排除 ([ff18788](https://github.com/meadmin-cn/midway-meamdin/commit/ff187889a574aad5ec4764de5ce1dee9f1498c0c))
* 修复api校验提示转义问题，优化非必填项非空校验判断 ([bd750db](https://github.com/meadmin-cn/midway-meamdin/commit/bd750db3827279cdfe5ae1a9be76b852881bb21f))
* 修复context全局请求域影响错误 ([86e2557](https://github.com/meadmin-cn/midway-meamdin/commit/86e25573028b5849305e9ac23a6efa70aa15caaf))
* 修复devtoolsJson 展示bug ([c79b3c1](https://github.com/meadmin-cn/midway-meamdin/commit/c79b3c1c4a3e931d548898ffeb71946bb5ecac03))
* 修复env多环境加载内容 ([b61a056](https://github.com/meadmin-cn/midway-meamdin/commit/b61a056ddb23588bf59ebd9a250caebd5c7395f1))
* 修复index模板引入顺序错误，修复eslint目录错误，省级自动创建包版本 ([c50fa17](https://github.com/meadmin-cn/midway-meamdin/commit/c50fa17a8b15c8bd4e784d3c61e240d897e98900))
* 修复tablead方法错误bug，修改外链 ([8a883aa](https://github.com/meadmin-cn/midway-meamdin/commit/8a883aaae64656e2013370e3c9ddd36a95d1ef28))
* 修复view 渲染时机问题 ([c025bd7](https://github.com/meadmin-cn/midway-meamdin/commit/c025bd734ae550b41c99eed757fb6ec65f82e20a))
* 优化meComponent组合异步组件调用逻辑 ([ed67f61](https://github.com/meadmin-cn/midway-meamdin/commit/ed67f61d9e2e7d43c3cbff2a6638a63a0b5e8c5f))
* 字典和详情调通 ([192b192](https://github.com/meadmin-cn/midway-meamdin/commit/192b192e72e81a7003d6d06348cc8d0cd673f81f))
* 最大化最小化设置初始宽高设置非写死像素 ([6818e03](https://github.com/meadmin-cn/midway-meamdin/commit/6818e034379c307be08a48548d2b43c131ee311e))
* **create-meadmin:** 优化提示语，重新生成template ([12a06de](https://github.com/meadmin-cn/midway-meamdin/commit/12a06de66897e19b616099b5f34941e8fbfa8a34))
* **index:** 修复加载问题,vue引入必须在element-plus之前，移除多余的组件 ([980b97b](https://github.com/meadmin-cn/midway-meamdin/commit/980b97b73a96489f64809e652ff94da7eda98891))
* **meadmin:** 升级midway/i18n到3.20.7 ([7557df6](https://github.com/meadmin-cn/midway-meamdin/commit/7557df6856beff3ab7134e7cb39ec539d2a0d687))
* **meadmin:** 优化后端i18n，增加前端入参控制语言 ([699a72f](https://github.com/meadmin-cn/midway-meamdin/commit/699a72f61a2849234ce219ecc93b6d44c4c6e780))
* meButton类型声明错误修复 ([eb29916](https://github.com/meadmin-cn/midway-meamdin/commit/eb2991615fcf6c024782cacdd7387e279b28de4b))
* menuItem改为全局组件 ([9de0b16](https://github.com/meadmin-cn/midway-meamdin/commit/9de0b1680986816f8026b2d552e1284003801b1e))
* meVxeTable组件修复loading ([8ba90b8](https://github.com/meadmin-cn/midway-meamdin/commit/8ba90b8cfd5811179ff07cea11f641a0d9530319))
* **midway-vite-view:** 升级view依赖到3.20.17 ([9bd2176](https://github.com/meadmin-cn/midway-meamdin/commit/9bd2176344fd16ca3da381d259215c346a8f5b1c))
* swagger 类引用改为函数延迟引用 防止时机问题 ([0435188](https://github.com/meadmin-cn/midway-meamdin/commit/0435188fb2c67f517626e7e947361b3a2142e25f))
* typescript的preserveSymlinks设置为false确保和pnpm符号链接兼容 ([c5df23c](https://github.com/meadmin-cn/midway-meamdin/commit/c5df23c314198479e2bcf325b99c6f282c86aa6e))


### 其他[chore]

* 版本号改为1.0.2 ([3a93833](https://github.com/meadmin-cn/midway-meamdin/commit/3a93833988a8193761b26360261a7b6b8cce127b))
* 版本升级 ([d41404e](https://github.com/meadmin-cn/midway-meamdin/commit/d41404eb2d78070e522534f8d11057e9e0edf4f5))
* 初始化模板 ([9895270](https://github.com/meadmin-cn/midway-meamdin/commit/9895270933817e6b4c709a94285ff5816016f81e))
* 更新对等依赖peerDependencies版本控制 ([2f98318](https://github.com/meadmin-cn/midway-meamdin/commit/2f98318c18ddbc755b739ca64759e6b2c5fadf96))
* 还原版本号 ([05dddad](https://github.com/meadmin-cn/midway-meamdin/commit/05dddadb83fc1353527ecae0234923ea515388ed))
* 加上代码发布和git提交规范 ([9896e1e](https://github.com/meadmin-cn/midway-meamdin/commit/9896e1e2aa87f46e8653ab5283bd783e0a6d3a76))
* 临时存储 ([11bf48e](https://github.com/meadmin-cn/midway-meamdin/commit/11bf48e116cfbab6f5798ad04f706df0c62886ee))
* 删除多余的错误文件 ([c4df699](https://github.com/meadmin-cn/midway-meamdin/commit/c4df69986a72af53e57c3dbd16da4da1e9a880ea))
* 升级vue和element-plus版本 ([31b0b2c](https://github.com/meadmin-cn/midway-meamdin/commit/31b0b2cbb6804f5b735171e86a7d72d0ad0b1059))
* 升级vxe-table^4.17.2、unplugin-auto-import^20.2.0、unplugin-vue-components^30.0.0 ([f95c470](https://github.com/meadmin-cn/midway-meamdin/commit/f95c470b20e6e6797aa92f0b8ed1e69b4a14f742))
* **core:** 删除多余的引用 ([5c50ebf](https://github.com/meadmin-cn/midway-meamdin/commit/5c50ebf47a4e96488ddffa32e14ec26ee4cebf12))
* **meadmin:** :art: seqlize省级到7.0.0-alpha.47 ([c67b45d](https://github.com/meadmin-cn/midway-meamdin/commit/c67b45d592a83c8a8021563d8e50b6e2121f674d))
* **meadmin:** 加上vscode推荐扩展 ([8072e54](https://github.com/meadmin-cn/midway-meamdin/commit/8072e544eef44e86c771d2e060989572538313bf))
* midway升级到3.20.19 ([06dcb75](https://github.com/meadmin-cn/midway-meamdin/commit/06dcb751edd0b8d081ffe1eddd5242392e194c0f))


### 文档更改[docs]

* 包作者声明 ([1179df3](https://github.com/meadmin-cn/midway-meamdin/commit/1179df325ed1348c4ff196fa31f269d962c25f13))
* 加上说明文件 ([9d01733](https://github.com/meadmin-cn/midway-meamdin/commit/9d017336f87c9bbaba4de1df18a5b9bb4df43a07))
* 文档更改 ([77244db](https://github.com/meadmin-cn/midway-meamdin/commit/77244db95fb247b727c5cf68f61a223d7669c01a))
* 修改说明文件 ([5d4e699](https://github.com/meadmin-cn/midway-meamdin/commit/5d4e699bd2562eafd97d6a942c05a934c77ee965))
* 修改说明文件 ([5713324](https://github.com/meadmin-cn/midway-meamdin/commit/5713324c15293954720a484fee1e980f14b97af1))
* **midway-vite-view:** 修改包版本和说明 ([13c6181](https://github.com/meadmin-cn/midway-meamdin/commit/13c6181fd5543b3d748778d7715c8bee2058bc5f))


### 样式更改[style]

* 格式化 ([8b53948](https://github.com/meadmin-cn/midway-meamdin/commit/8b53948d34caf35803f7dd8af43b407d3650d609))
* 格式化配置调整 ([c39c652](https://github.com/meadmin-cn/midway-meamdin/commit/c39c652c439aa2ef542b3a29a5bd736dc3b588f9))
* 加上vscode配置 ([6cee349](https://github.com/meadmin-cn/midway-meamdin/commit/6cee34936db485ace4c9476bc4da84205a09c85c))


### 重构[refactor]

* 包名更改 ([81fd4e6](https://github.com/meadmin-cn/midway-meamdin/commit/81fd4e696e9562b6906e503d053b65cb85b090b9))
* 包名更改 ([19f2698](https://github.com/meadmin-cn/midway-meamdin/commit/19f26987f42bf5ec2a8be4e19aa9ddf6160ba0f5))
* 格式化文件 ([39f22a5](https://github.com/meadmin-cn/midway-meamdin/commit/39f22a55df3d860bffc02e9b8ebf2f01eb674fd6))
* 加上ssr兼容代码转换(admin仅支持客户端渲染) ([83e4658](https://github.com/meadmin-cn/midway-meamdin/commit/83e465859ff536fcebd059735787146e3e3f1ef8))
* 修改内容说明 ([72991e4](https://github.com/meadmin-cn/midway-meamdin/commit/72991e4ab97211b0fa9197f4ffd37ef981bc9275))
* 移除prod配置 ([9813ace](https://github.com/meadmin-cn/midway-meamdin/commit/9813ace5a7038547e426963a790ba54ddc87ea7c))
* 优化详情 展示及api调用方式，加上权限 ([362f3f1](https://github.com/meadmin-cn/midway-meamdin/commit/362f3f1fcb06201e64280e722bcfefcdde2e84b7))
* 优化commitlint规则读取 ([48ca126](https://github.com/meadmin-cn/midway-meamdin/commit/48ca126d52717d652fb4e6195b23bcab6aa968c2))
* 优化meButton写法 ([62f3ab1](https://github.com/meadmin-cn/midway-meamdin/commit/62f3ab16ff61e7438d58f0916568206ab1862c3a))
* **meadmin-view-admin:** 移除多余的告警和代码 ([56eb222](https://github.com/meadmin-cn/midway-meamdin/commit/56eb22247c1551675d0bd76144e2659300d95140))
* **meadmin:** 文件上传改为stronge可扩展形式 ([b252924](https://github.com/meadmin-cn/midway-meamdin/commit/b2529244b3da37bea2fb283687e57a4ba9dadb79))
* **meadmin:** 文件上传挪到file扩展文件中 ([f28ac9f](https://github.com/meadmin-cn/midway-meamdin/commit/f28ac9f1162437757c45bc60cfae1af6abd08c4f))
* meButton重新封装 ([fcdd8dc](https://github.com/meadmin-cn/midway-meamdin/commit/fcdd8dcf641920ba59e34d4aad856945966cd5d4))
* vscode配置自动移除引用 ([ba48f45](https://github.com/meadmin-cn/midway-meamdin/commit/ba48f451b8cdbd0263bee7dba98cbbe864a43db8))


### 性能改进[perf]

* 取消数据库外键，转为逻辑层 ([433e17c](https://github.com/meadmin-cn/midway-meamdin/commit/433e17c7985f7aa4244cebf41bbaeba419e2ba01))
* 取消数据库外键，转为逻辑层 ([b719871](https://github.com/meadmin-cn/midway-meamdin/commit/b719871c419831df2d3140c7293b83704834d4cd))
* 移除多余的加载配置 ([57c0dfe](https://github.com/meadmin-cn/midway-meamdin/commit/57c0dfed8e79e8eb7f572839c3fc6b6e73c81d09))
* **meadmin:** 页面渲染去除多余的await ([607bb77](https://github.com/meadmin-cn/midway-meamdin/commit/607bb77451ab4df739473acfd033eef6f1b45c76))
* midway-vite-view重写，优化api更新后，自动重启vite服务 ([e4e9d65](https://github.com/meadmin-cn/midway-meamdin/commit/e4e9d65a8542ac0edf9e6bcd3be9dfab5d388077))
* pnpm:autoInstallPeers:false;view-admin设置ts-node为nodenext；vite-plugin-compression替换为2 ([8042e3d](https://github.com/meadmin-cn/midway-meamdin/commit/8042e3dd1ebf594fdb817fe2fc822ee9ed093e63))


### CI发版[ci]

* 调试命令加上，清空目标文件夹 ([2c30c9a](https://github.com/meadmin-cn/midway-meamdin/commit/2c30c9aa1c2ba05f36c310abd14584bd11b0bea6))
