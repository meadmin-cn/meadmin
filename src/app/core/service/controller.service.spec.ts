import { Controller } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ControllerService } from './controller.service';
import { DiscoveryService } from './discovery.service';

describe('ControllerService', () => {
  let service: ControllerService;

  let module: TestingModule;
  @Controller()
  class BaseController {}

  @Controller('base1')
  class Base1Controller extends BaseController {}

  @Controller(['base21', 'base22'])
  class Base2Controller extends Base1Controller {}

  @Controller({ path: 'base3' })
  class Base3Controller extends Base2Controller {}
  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [ControllerService, DiscoveryService, Reflector],
      controllers: [Base3Controller],
    }).compile();
    service = module.get<ControllerService>(ControllerService);
  });
  describe('resolverPaths', () => {
    let resolverPaths: ControllerService['resolverPaths'];
    beforeAll(async () => {
      resolverPaths = Reflect.get(service, 'resolverPaths');
    });
    it('resolver 空路径', async () => {
      const expecter = expect(resolverPaths(''));
      expecter.toHaveLength(0);
    });
    it('resolver string路径', async () => {
      const expecter = expect(resolverPaths('a'));
      expecter.toEqual(expect.arrayContaining(['/a']));
      expecter.toHaveLength(1);
    });
    it('resolver string数组', async () => {
      const expecter = expect(resolverPaths(['a', '']));
      expecter.toEqual(expect.arrayContaining(['/a', '/']));
      expecter.toHaveLength(2);
    });
  });
  describe('初始化', () => {
    beforeAll(async () => service.init());
    it('expecter', async () => {
      const expecter = expect(
        Reflect.getMetadata(PATH_METADATA, BaseController),
      );
      expecter.toEqual(expect.arrayContaining(['/']));
      expecter.toHaveLength(1);
    });
    it('非空', async () => {
      const expecter = expect(
        Reflect.getMetadata(PATH_METADATA, Base1Controller),
      );
      expecter.toEqual(expect.arrayContaining(['/base1']));
      expecter.toHaveLength(1);
    });
    it('数组path', async () => {
      const expecter = expect(
        Reflect.getMetadata(PATH_METADATA, Base2Controller),
      );
      expecter.toEqual(
        expect.arrayContaining(['/base1/base21', '/base1/base22']),
      );
      expecter.toHaveLength(2);
    });
    it('属性path', async () => {
      const expecter = expect(
        Reflect.getMetadata(PATH_METADATA, Base3Controller),
      );
      expecter.toEqual(
        expect.arrayContaining(['/base1/base21/base3', '/base1/base22/base3']),
      );
      expecter.toHaveLength(2);
    });
  });
});
