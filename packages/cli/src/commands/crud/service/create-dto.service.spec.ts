import { resolve } from 'path';
import { CreateDtoService } from './create-dto.service';

describe('crud createDto service', () => {
  describe('path为类名', () => {
    let service: CreateDtoService;
    beforeAll(() => {
      service = new CreateDtoService('CreateAaBbCc', 'AaBbCc', 'AaBbCc');
    });
    it('检测 name和path', () => {
      expect(service.className).toBe('CreateAaBbCcDto');
      expect(service.toPath).toBe(
        resolve('create-aa-bb-cc.dto.ts').replace(/\\/g, '/'),
      );
      expect(service.baseName).toBe('AaBbCc');
      expect(service.basePath).toBe(resolve('aa-bb-cc.ts').replace(/\\/g, '/'));
    });
    it('检测内容', () => {
      expect(service.getContent()).toBe(
        `import { AaBbCc } from './aa-bb-cc';

export class CreateAaBbCcDto extends AaBbCc {}
`,
      );
    });
  });
  describe('path为路径', () => {
    let service: CreateDtoService;
    beforeAll(() => {
      service = new CreateDtoService(
        'dd/create-aa-bb-cc.dto',
        'dd/aa-bb-cc.entity',
        'AaBbCc',
      );
    });
    it('检测 name和path', () => {
      expect(service.className).toBe('CreateAaBbCcDto');
      expect(service.toPath).toBe(
        resolve('dd/create-aa-bb-cc.dto.ts').replace(/\\/g, '/'),
      );
      expect(service.baseName).toBe('AaBbCc');
      expect(service.basePath).toBe(
        resolve('dd/aa-bb-cc.entity.ts').replace(/\\/g, '/'),
      );
    });
    it('检测内容', () => {
      expect(service.getContent()).toBe(
        `import { AaBbCc } from './aa-bb-cc.entity';

export class CreateAaBbCcDto extends AaBbCc {}
`,
      );
    });
  });
});
