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

export class ServiceService {
  private template = readFileSync(
    resolve(__dirname, '../../../../template/crud/service.ts'),
    'utf-8',
  );

  public className: string; //create-dto类名

  public constructor(
    public toPath: string,
    public createDtoPath: string,
    public createDtoName: string,
    public updateDtoPath: string,
    public updateDtoName: string,
    public entityPath: string,
    public entityName: string,
  ) {
    this.toPath = resovePath(normalizeToKebabOrSnakeCase(toPath), [
      '.service',
      '.ts',
    ]);
    this.className = upFirstCase(
      toHump(
        relativePath('', toPath, ['.service', '.ts']).split('/').pop()! +
          'Service',
      ),
    );
  }

  public getContent() {
    return this.template
      .replace(/__CreateDto__/g, this.createDtoName)
      .replace(/__createDto__/g, lowerFirstCase(this.createDtoName))
      .replace(/__-createDto__/g, relativePath(this.toPath, this.createDtoPath))
      .replace(/__UpdateDto__/g, this.updateDtoName)
      .replace(/__updateDto__/g, lowerFirstCase(this.updateDtoName))
      .replace(/__-updateDto__/g, relativePath(this.toPath, this.updateDtoPath))
      .replace(/__Entity__/g, this.entityName)
      .replace(/__entity__/g, lowerFirstCase(this.entityName))
      .replace(/__-entity__/g, relativePath(this.toPath, this.entityPath))
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
