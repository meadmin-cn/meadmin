# docs/assets

README 首屏演示素材（仅本目录内文件入仓库；中间产物与验收帧均在 `.workbuddy/recordings/`，不入库）。

| 文件 | 内容 | 状态 |
|---|---|---|
| `crud-demo.gif` | 三镜头演示动图：编辑器 entity → 终端 `pnpm exec meadmin sync/crud --menu` → 浏览器刷新出列表页（960×560，260 帧，14.3s，3.6MB） | ✅ README 已引用 |
| `admin-dashboard.png` | 后台仪表盘（数据概览 + 图表，1440×900@2x，侧栏展开） | ✅ README 已引用 |
| `admin-list.png` | 一键 CRUD 示例列表（搜索区展开 + 表格 + 分页，1440×900@2x，侧栏展开） | ✅ README 已引用 |
| `rbac-config.png` | 菜单权限 RBAC 配置页（角色组 + 菜单树，1440×900@2x，侧栏展开） | ✅ README 已引用 |

中间产物（`.workbuddy/recordings/`）：`admin-list-960.png`（GIF 浏览器镜头素材）、`crud-demo-{editor,term,browser,last-frame}.png`（各镜头验收帧）、`login-desktop.png`（登录页，投稿配图备用）、`out-{sync,crud}.txt`（命令真实输出）。

## 重录方法

1. 后台截图：`node .workbuddy/promo-shots.cjs`（Playwright + Edge，验证码经 Redis 读取，需 dev 服务已启动）。侧边栏折叠状态持久化在 localStorage `me-config-theme`，脚本已预置 `menuCollapse=false` 并带刷新重试保障。
2. GIF 录屏：
   - 第一步捕获真实输出（需可连数据库，`-m local` 会加载 `.env.local`）：
     ```bash
     pnpm exec meadmin sync exampleDemo -m local > .workbuddy/recordings/out-sync.txt
     pnpm exec meadmin crud exampleDemo --menu -f -m local > .workbuddy/recordings/out-crud.txt
     ```
     （`-f` 覆盖已生成文件；执行后 `git checkout -- src/app/admin view/admin` 还原）
   - 第二步截取浏览器镜头素材：`node .workbuddy/promo-shot-list-small.cjs`（1920×1044，缩放进 960 宽镜头零裁切）。
   - 第三步合成 GIF：`node .workbuddy/promo-demo-gif.cjs`（Playwright 渲染编辑器/终端/浏览器三镜头 → pngjs + gif-encoder 编码）。
