export interface ViteViewConfig {
  prod?: boolean;
  rootDir: string;
  views: Record<
    string,
    {
      entryServer?: string;
      viteConfigFile: string; //vite config的文件地址 相对于前端项目文件夹
      staticFileKey: string; //staticFile的key默认为default
      entry: string; //相对于前端项目文件夹的html 路径
      hmrPort: number; //热更新监听端口，会自动查找可用端口
    }
  >;
}

export interface CommandOptions {
  [x: string]: any;
  type: 1 | 2;
  config: string;
  outDir: string;
  viteConfigFile: string;
  viewDir: string;
  prefix: string;
  outPrefix: string;
  staticFileKey: string;
}
