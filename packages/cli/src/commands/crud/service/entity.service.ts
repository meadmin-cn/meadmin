import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

import {
  toHump,
  upFirstCase,
  lowerFirstCase,
  resovePath,
  relativePath,
  normalizeToKebabOrSnakeCase,
} from '../../../utils/formatting';
import { Log } from '../../../utils/log';

export class EntityService {
  private template = readFileSync(
    resolve(__dirname, '../../../../template/crud/entities/entity.ts'),
    'utf-8',
  );

  public baseName: string; //基类名称
  public className: string; //entity类名

  public constructor(public toPath: string, public basePath: string) {
    this.toPath = resovePath(normalizeToKebabOrSnakeCase(toPath), [
      '.entity',
      '.ts',
    ]);
    this.className = upFirstCase(
      toHump(relativePath('', toPath, ['.entity', '.ts']).split('/').pop()!),
    );
    this.basePath = resovePath(
      normalizeToKebabOrSnakeCase(basePath),
      basePath.endsWith('.ts') ? [] : ['.entity', '.ts'],
    );
    this.baseName = upFirstCase(
      toHump(relativePath('', basePath, ['.entity', '.ts']).split('/').pop()!),
    );
  }

  public getContent() {
    return this.template
      .replace(/__Base__/g, this.baseName)
      .replace(/__base__/g, lowerFirstCase(this.baseName))
      .replace(/__-base__/g, relativePath(this.toPath, this.basePath))
      .replace(/__Name__/g, this.className)
      .replace(/__name__/g, lowerFirstCase(this.className));
  }

  public writeFile() {
    const path = dirname(this.toPath);
    mkdirSync(path, { recursive: true });
    writeFileSync(this.toPath, this.getContent());
    Log.success(`make ${this.toPath} success`);
    return true;
  }
}
