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

export class CreateDtoService {
  private template = readFileSync(
    resolve(__dirname, '../../../../template/crud/dto/create.dto.ts'),
    'utf-8',
  );

  public baseName: string; //基类名称
  public className: string; //entity类名

  public constructor(public toPath: string, public basePath: string) {
    this.toPath = resovePath(normalizeToKebabOrSnakeCase(toPath), [
      '.dto',
      '.ts',
    ]);
    this.className = upFirstCase(
      toHump(relativePath('', toPath, ['.dto', '.ts']).split('/').pop()!),
    );
    this.basePath = resovePath(normalizeToKebabOrSnakeCase(basePath));
    this.baseName = upFirstCase(
      toHump(relativePath('', basePath, ['.entity', '.ts']).split('/').pop()!),
    );
  }

  public getContent() {
    console.log(this.toPath, this.basePath);
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
    console.info(`make ${this.toPath} success`);
    return true;
  }
}
