import { setEnv } from '@/utils/env.js';
import { Command } from 'commander';
import extend from 'extend2';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { resolve } from 'path';
import { build as buildVite, loadConfigFromFile, normalizePath } from 'vite';

interface LookupFileOptions {
  pathOnly?: boolean;
  rootDir?: string;
  predicate?: (file: string) => boolean;
}
export function lookupFile(dir: string, formats: string[], options?: LookupFileOptions): string | undefined {
  for (const format of formats) {
    const fullPath = path.join(dir, format);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const result = options?.pathOnly ? fullPath : fs.readFileSync(fullPath, 'utf-8');
      if (!options?.predicate || options.predicate(result)) {
        return result;
      }
    }
  }
  const parentDir = path.dirname(dir);
  if (parentDir !== dir && (!options?.rootDir || parentDir.startsWith(options?.rootDir))) {
    return lookupFile(parentDir, formats, options);
  }
}

export class Build {
  public options = {} as Record<string, any>;
  private pages = {} as Record<
    string,
    {
      name: string;
      clientIndex: string;
      entryServers?: string;
      viteConfigFile?: string;
      prefix: string;
      outDir: string; //staticFile的key默认为default
    }
  >;
  private env = 'prod';
  private midwayConfig = {} as any;
  private viteCofigs: any = {};
  private rootDir = process.cwd();
  initEnv() {
    if (process.env.MIDWAY_SERVER_ENV) {
      this.env = process.env.MIDWAY_SERVER_ENV;
    } else if (process.env.NODE_ENV) {
      this.env = process.env.NODE_ENV;
    }
  }
  async getConfig() {
    this.midwayConfig = {
      viteView: {
        rootDir: {
          default: path.join(this.rootDir, './view'),
        },
      },
      staticFile: {
        dirs: {
          default: {
            prefix: '/public',
            dir: 'public',
          },
        },
      },
    };
    try {
      let configFiles;
      const stat = await fs.statSync(this.options.config);
      if (stat.isFile()) {
        configFiles = [this.options.config];
      } else {
        configFiles = [this.options.config + '/config.default.ts', this.options.config + `/config.${this.env}.ts`].filter((file) => fs.existsSync(file));
      }
      await Promise.all(
        configFiles.map((file) => {
          return (async () => {
            const { config } = (await loadConfigFromFile({  command: "build", mode: 'prod'}, file))!;
            this.midwayConfig = extend(true, this.midwayConfig, config);
          })();
        }),
      );
    } catch (e) {
      console.error('解析midway配置失败你可以使用-t 2 用文件名匹配模式进行构建');
      throw e;
    }
  }
  async formatOptions() {
    this.initEnv();
    if (!this.options.config) {
      this.options.config = 'src/config';
    }
    await this.getConfig();
    this.options.viewDir = this.midwayConfig.viteView.rootDir;
    // set absolute path
    Object.keys(this.options).forEach((key) => {
      if (['viewDir'].includes(key)) {
        this.options[key] = this.getDiskPath(this.options[key]);
      }
    });
  }
  getViteFilePath(filePath?: string) {
    if (filePath) {
      if (!fs.existsSync(filePath)) {
        throw new Error(`vite 配置文件 ${filePath} 不存在`);
      }
      return filePath;
    }
    filePath = this.getDiskPath('vite.config.js');
    if (!fs.existsSync(filePath!)) {
      filePath = this.getDiskPath('vite.config.ts');
    }
    if (!fs.existsSync(filePath!)) {
      throw new Error(`vite 配置文件 vite.config.js、${filePath} 不存在`);
    }
    return filePath;
  }
  async getViteConfig(path?: string) {
    if (!this.viteCofigs[path ?? 'default']) {
      const { config } = (await loadConfigFromFile({ command: 'build', mode: this.env, isSsrBuild: true }, this.getViteFilePath(path ?? this.options.viteConfigFile)))!;
      this.viteCofigs[path ?? 'default'] = config;
      if (config.build && config.build.rollupOptions && config.build.rollupOptions.input) {
        console.warn('[vite view] vite配置文件中指定了rollupOptions.input，打包时将应用此构建，如果不确定配置值是否正确，请删除build.rollupOptions.input配置');
      }
    }
    return this.viteCofigs[path ?? 'default'];
  }

  async setFileByConfig() {
    for (const [index, ssr] of Object.entries<any>(this.midwayConfig.viteView.views)) {
      this.pages[index] = {
        name: index,
        clientIndex: path.resolve(this.options.viewDir, index, ssr.entry),
        entryServers: ssr.entryServer ? path.resolve(this.options.viewDir, index, ssr.entryServer) : undefined,
        viteConfigFile: path.resolve(this.options.viewDir, index, ssr.viteConfigFile),
        prefix: normalizePath('/' + this.midwayConfig.staticFile.dirs[ssr.staticFileKey].prefix + '/'),
        outDir: this.getDiskPath(this.midwayConfig.staticFile.dirs[ssr.staticFileKey].dir)!,
      };
    }
  }
  async run() {
    for (const [, info] of Object.entries(this.pages)) {
      console.log('[vite view] build ' + (info.viteConfigFile ?? '') + '\n');
      await this.buildClient(info.clientIndex, info.prefix, info.outDir, info.viteConfigFile!);
      fs.writeFileSync(info.outDir + '/.gitkeep', '');
      if (info.entryServers) {
        await this.buildSSR(info.entryServers, info.prefix, path.parse(info.outDir + '/ssr/' + path.relative(`${this.options.viewDir}/${info.name}`, info.entryServers)).dir, info.viteConfigFile!);
      }
    }
  }

  async buildClient(input: string, prefix: string, outDir: string, viteConfigFile: string) {
    console.log(`[vite view] build client ${input}\n`);
    await buildVite({
      base: prefix,
      configFile: viteConfigFile,
      build: {
        outDir: outDir,
        ssrManifest: 'ssr-manifest.json',
        rollupOptions: { input },
        ssr: false,
        emptyOutDir: true,
      },
    });
    const content = fs.readFileSync(path.resolve(outDir, 'ssr-manifest.json'), 'utf8');
    const viteConfig = await this.getViteConfig(viteConfigFile);
    fs.writeFileSync(path.resolve(outDir, 'ssr-manifest.json'), content.replace(new RegExp('"/' + (viteConfig.build?.assetsDir || 'assets'), 'g'), '"' + prefix + (viteConfig.build?.assetsDir || 'assets')));
  }

  async buildSSR(entryServers: string, prefix: string, outDir: string, viteConfigFile: string) {
    console.log(`[vite view] build ssr ${entryServers}\n`);
    await (async () => {
      const viteConfig = await this.getViteConfig(viteConfigFile);
      let packagePath = '';
      let packageStr = '';
      if (viteConfig.ssr && viteConfig.ssr.format === 'cjs') {
        packagePath = lookupFile(viteConfig.root, ['package.json'], {
          pathOnly: true,
        })||'';
        if (packagePath) {
          packageStr = fs.readFileSync(packagePath, 'utf-8');
          const packageInfo = JSON.parse(packageStr);
          if (packageInfo.type && packageInfo.type === 'module') {
            packageInfo.type = 'commonjs';
            fs.writeFileSync(packagePath, JSON.stringify(packageInfo), 'utf-8');
          } else {
            packagePath = '';
          }
        }
      }
      await buildVite({
        base: prefix,
        publicDir: false,
        configFile: viteConfigFile,
        build: {
          emptyOutDir: true,
          outDir: outDir,
          ssrManifest: false,
          ssr: entryServers,
        },
      });
      if (packagePath) {
        fs.writeFileSync(packagePath, packageStr, 'utf-8');
      }
    })();
  }

  private getDiskPath(path?: string) {
    if (typeof path === 'string') {
      if (!path) {
        return this.rootDir;
      }
      return resolve(this.rootDir, path);
    } else {
      return path;
    }
  }
}

export const buildInit = (program: Command) => {
  program
    .command('build')
    .description('build vite文件')
    .option('--config <char>', '配置文件夹/配置文件', 'src/config')
    .option('-m, --module <char>', 'env环境变量', 'production')
    .action(async (options) => {
      setEnv(options.module);
      const build = new Build();
      build.options = options;
      await build.formatOptions();
      await build.setFileByConfig();
      await build.run();
    });
};
