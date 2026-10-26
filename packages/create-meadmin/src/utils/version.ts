//设置 meadmin 各包与仓库根的版本号（release 命令与 version 命令共用）
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** meadmin update 只认纯 x.y.z，设置版本时就卡住，别等到发版才发现 */
export const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

export function assertVersion(version: string): string {
  const trimmed = version.trim();
  if (!VERSION_PATTERN.test(trimmed)) throw new Error(`版本号必须是 x.y.z 形式的稳定版本：${version}`);
  return trimmed;
}

export function readVersion(root: string): string {
  return JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
}

export type VersionChange = { name: string; file: string; from: string };

/**
 * 把版本号写入 packages/* 与仓库根 package.json，返回实际发生变化的包。
 * 已是指定版本的文件不重写，避免无意义的时间戳变化。
 */
export function setVersions(root: string, version: string): VersionChange[] {
  const target = assertVersion(version);
  const changes: VersionChange[] = [];
  const write = (file: string) => {
    const content = JSON.parse(readFileSync(file, 'utf8'));
    if (content.version === target) return;
    const from = content.version;
    content.version = target;
    writeFileSync(file, JSON.stringify(content, null, 2) + '\n', 'utf8');
    changes.push({ name: content.name, file, from });
  };

  const packagesDir = join(root, 'packages');
  if (existsSync(packagesDir)) {
    for (const name of readdirSync(packagesDir)) {
      const file = join(packagesDir, name, 'package.json');
      if (existsSync(file)) write(file);
    }
  }
  write(join(root, 'package.json'));
  return changes;
}
