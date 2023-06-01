import { resolve } from 'path';
import { EntityService } from './entity.service';

describe('crud entity service', () => {
  describe('path为类名', () => {
    let service: EntityService;
    beforeAll(() => {
      service = new EntityService('aaBbCc', 'aaBbBase');
    });
    it('检测 name和path', () => {
      expect(service.className).toBe('AaBbCc');
      expect(service.toPath).toBe(
        resolve('aa-bb-cc.entity.ts').replace(/\\/g, '/'),
      );
      expect(service.baseName).toBe('AaBbBase');
      expect(service.basePath).toBe(
        resolve('aa-bb-base.ts').replace(/\\/g, '/'),
      );
    });
    it('检测内容', () => {
      expect(service.getContent()).toBe(
        `import { Entity } from 'typeorm';
import { AaBbBase as Base } from './aa-bb-base';

@Entity()
export class AaBbCc extends Base {}
`,
      );
    });
  });
  describe('path为路径', () => {
    let service: EntityService;
    beforeAll(() => {
      service = new EntityService('dd/aaBbCc.entity', 'dd/aaBbBase');
    });
    it('检测 name和path', () => {
      expect(service.className).toBe('AaBbCc');
      expect(service.toPath).toBe(
        resolve('dd/aa-bb-cc.entity.ts').replace(/\\/g, '/'),
      );
      expect(service.baseName).toBe('AaBbBase');
      expect(service.basePath).toBe(
        resolve('dd/aa-bb-base.ts').replace(/\\/g, '/'),
      );
    });
    it('检测内容', () => {
      expect(service.getContent()).toBe(
        `import { Entity } from 'typeorm';
import { AaBbBase as Base } from './aa-bb-base';

@Entity()
export class AaBbCc extends Base {}
`,
      );
    });
  });
});
