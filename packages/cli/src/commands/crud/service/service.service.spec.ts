import { resolve } from 'path';
import { ServiceService } from './service.service';

describe('crud entity service', () => {
  describe('path为类名', () => {
    let service: ServiceService;
    beforeAll(() => {
      service = new ServiceService(
        'aaBbCc',
        'dto/create.dto.ts',
        'CreateDto',
        'dto/update.dto.ts',
        'UpdateDto',
        'entity/entity.ts',
        'Entity',
      );
    });
    it('检测 name和path', () => {
      expect(service.className).toBe('AaBbCcService');
      expect(service.toPath).toBe(
        resolve('aa-bb-cc.service.ts').replace(/\\/g, '/'),
      );
    });
    it('检测内容', () => {
      expect(service.getContent()).toBe(
        `import { Injectable } from '@nestjs/common';
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';
import { Entity } from './entity/entity';

@Injectable()
export class AaBbCcService {
  create(createDto: CreateDto) {
    return Entity.create(createDto);
  }

  findAll() {
    return Entity.find();
  }

  findOne(id: number) {
    return Entity.findOneBy({ id });
  }

  update(id: number, updateDto: UpdateDto) {
    return Entity.update(id, updateDto);
  }

  remove(id: number) {
    return Entity.delete(id);
  }
}
`,
      );
    });
  });
  describe('path为路径', () => {
    let service: ServiceService;
    beforeAll(() => {
      service = new ServiceService(
        'aaBbCc.service',
        'dto/create.dto.ts',
        'CreateDto',
        'dto/update.dto.ts',
        'UpdateDto',
        'entity/entity.ts',
        'Entity',
      );
    });
    it('检测 name和path', () => {
      expect(service.className).toBe('AaBbCcService');
      expect(service.toPath).toBe(
        resolve('aa-bb-cc.service.ts').replace(/\\/g, '/'),
      );
    });
    it('检测内容', () => {
      expect(service.getContent()).toBe(
        `import { Injectable } from '@nestjs/common';
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';
import { Entity } from './entity/entity';

@Injectable()
export class AaBbCcService {
  create(createDto: CreateDto) {
    return Entity.create(createDto);
  }

  findAll() {
    return Entity.find();
  }

  findOne(id: number) {
    return Entity.findOneBy({ id });
  }

  update(id: number, updateDto: UpdateDto) {
    return Entity.update(id, updateDto);
  }

  remove(id: number) {
    return Entity.delete(id);
  }
}
`,
      );
    });
  });
});
