//归档文件列表，支持递归忽略和重新设置内容，key以/结尾表示文件夹
//类型： Record<string,
//   {
//     ignore?: Array<string | RegExp>; //会递归应用忽略
//     fileSetFunction?: Record<string, (content: string) => string | Promise<string>>;//会重新设置内容
//   }>;
export default {
  './.env': {},
  './.npmrc': {},
  './logs/.gitkeep': {},
  './bootstrap.js': {},
  './package.json': {},
  './pnpm-lock.yaml': {},
  './pnpm-workspace.yaml': {},
  './dist/': {},
  './public/': {},
  './uploadFile/': {},
  './view/admin/dist/': {},
  './view/index/dist/': {},
  './view/admin/package.json': {},
  './view/index/package.json': {},
  './addons/': {
    ignore: [/.*\/node_modules/],
  },
};
