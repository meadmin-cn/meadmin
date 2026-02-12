

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
