import { resolve } from 'path';
import { CreateDtoService } from './create-dto.service';

describe('crud createDto service', () => {
  describe('path为类名', () => {
    let service: CreateDtoService;
    beforeAll(() => {
      service = new CreateDtoService('aaBbCc', 'aaBbBase');
    });
    it('检测 name和path', () => {
      expect(service.className).toBe('AaBbCc');
      expect(service.toPath).toBe(
        resolve('aa-bb-cc.dto.ts').replace(/\\/g, '/'),
      );
      expect(service.baseName).toBe('AaBbBase');
      expect(service.basePath).toBe(
        resolve('aa-bb-base.ts').replace(/\\/g, '/'),
      );
    });
    it('检测内容', () => {
      expect(service.getContent()).toBe(
        `import { Entity } from 'typeorm';
import { AaBbBase } from 'aa-bb-base';

@Entity()
export class AaBbCc extends AaBbBase {}
`,
      );
    });
  });
  describe('path为路径', () => {
    let service: CreateDtoService;
    beforeAll(() => {
      service = new CreateDtoService('dd/aaBbCc.dto', 'dd/aaBbBase');
    });
    it('检测 name和path', () => {
      expect(service.className).toBe('AaBbCc');
      expect(service.toPath).toBe(
        resolve('dd/aa-bb-cc.dto.ts').replace(/\\/g, '/'),
      );
      expect(service.baseName).toBe('AaBbBase');
      expect(service.basePath).toBe(
        resolve('dd/aa-bb-base.ts').replace(/\\/g, '/'),
      );
    });
    it('检测内容', () => {
      expect(service.getContent()).toBe(
        `import { Entity } from 'typeorm';
import { AaBbBase } from 'aa-bb-base';

@Entity()
export class AaBbCc extends AaBbBase {}
`,
      );
    });
  });
});
