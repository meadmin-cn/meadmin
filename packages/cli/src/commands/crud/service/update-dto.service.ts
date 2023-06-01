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

export class UpdateDtoService {
  private template = readFileSync(
    resolve(__dirname, '../../../../template/crud/dto/update.dto.ts'),
    'utf-8',
  );

  public baseName: string; //基类名称
  public className: string; //create-dto类名

  public constructor(public toPath: string, public basePath: string) {
    this.toPath = resovePath(normalizeToKebabOrSnakeCase(toPath), [
      '.dto',
      '.ts',
    ]);
    this.className = upFirstCase(
      toHump(
        relativePath('', toPath, ['.dto', '.ts']).split('/').pop()! + 'Dto',
      ),
    );
    this.basePath = resovePath(normalizeToKebabOrSnakeCase(basePath));
    this.baseName = upFirstCase(
      toHump(relativePath('', basePath, ['.dto', '.ts']).split('/').pop()!),
    );
    if (this.basePath.endsWith('.dto.ts')) {
      this.baseName += 'Dto';
    }
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
