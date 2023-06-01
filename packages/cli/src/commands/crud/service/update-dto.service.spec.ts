import { resolve } from 'path';
import { UpdateDtoService } from './update-dto.service';

describe('crud updateDto service', () => {
  describe('path为类名', () => {
    let service: UpdateDtoService;
    beforeAll(() => {
      service = new UpdateDtoService('UpdateAaBbCc', 'CreateAaBbCc');
    });
    it('检测 name和path', () => {
      expect(service.className).toBe('UpdateAaBbCcDto');
      expect(service.toPath).toBe(
        resolve('update-aa-bb-cc.dto.ts').replace(/\\/g, '/'),
      );
      expect(service.baseName).toBe('CreateAaBbCc');
      expect(service.basePath).toBe(
        resolve('create-aa-bb-cc.ts').replace(/\\/g, '/'),
      );
    });
    it('检测内容', () => {
      expect(service.getContent()).toBe(
        `import { PartialType } from '@meadmin/nest-swagger';
import { CreateAaBbCc } from './create-aa-bb-cc';

export class UpdateAaBbCcDto extends PartialType(CreateAaBbCc) {}
`,
      );
    });
  });
  describe('path为路径', () => {
    let service: UpdateDtoService;
    beforeAll(() => {
      service = new UpdateDtoService(
        'dd/update-aa-bb-cc.dto',
        'dd/create-aa-bb-cc.dto',
      );
    });
    it('检测 name和path', () => {
      expect(service.className).toBe('UpdateAaBbCcDto');
      expect(service.toPath).toBe(
        resolve('dd/update-aa-bb-cc.dto.ts').replace(/\\/g, '/'),
      );
      expect(service.baseName).toBe('CreateAaBbCcDto');
      expect(service.basePath).toBe(
        resolve('dd/create-aa-bb-cc.dto.ts').replace(/\\/g, '/'),
      );
    });
    it('检测内容', () => {
      expect(service.getContent()).toBe(
        `import { PartialType } from '@meadmin/nest-swagger';
import { CreateAaBbCcDto } from './create-aa-bb-cc.dto';

export class UpdateAaBbCcDto extends PartialType(CreateAaBbCcDto) {}
`,
      );
    });
  });
});
