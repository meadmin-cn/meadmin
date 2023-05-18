import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryService } from './discovery.service';
import { SwaggerService } from './swagger.service';
import { DocumentBuilder, NestSwaggerModule } from '@meadmin/nest-swagger';

describe('SwaggerService', () => {
  let service: SwaggerService;
  let module: TestingModule;
  @Module({})
  class Test11Module {}
  @Module({ imports: [Test11Module] })
  class Test1Module {}
  @Module({ imports: [Test1Module] })
  class TestModule {}

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TestModule],
      providers: [SwaggerService, DiscoveryService, Reflector],
    }).compile();
    service = module.get<SwaggerService>(SwaggerService);
  });

  it('swaggerConfigModule ', async () => {
    const swaggerConfigModule: SwaggerService['swaggerConfigModule'] =
      Reflect.get(service, 'swaggerConfigModule');
    const config = await swaggerConfigModule.call(service, {
      open: true,
      path: 'doc',
      documentConfig: [
        {
          module: 'test',
          deepIncludes: true,
          config: new DocumentBuilder()
            .setTitle('接口文档')
            .setDescription('接口文档')
            .setVersion('1.0')
            .build(),
          options: {
            include: [TestModule],
          },
        },
      ],
    });
    expect(config.documentConfig[0].options?.include).toEqual(
      expect.arrayContaining([TestModule, Test1Module, Test11Module]),
    );
  });

  it('swaggerConfigModule no deep ', async () => {
    const swaggerConfigModule: SwaggerService['swaggerConfigModule'] =
      Reflect.get(service, 'swaggerConfigModule');
    const config = await swaggerConfigModule.call(service, {
      open: true,
      path: 'doc',
      documentConfig: [
        {
          module: 'test',
          deepIncludes: false,
          config: new DocumentBuilder()
            .setTitle('接口文档')
            .setDescription('接口文档')
            .setVersion('1.0')
            .build(),
          options: {
            include: [TestModule],
          },
        },
      ],
    });
    expect(config.documentConfig[0].options?.include).toContain(TestModule);
    expect(config.documentConfig[0].options?.include).not.toContain(
      Test1Module,
    );
    expect(config.documentConfig[0].options?.include).not.toContain(
      Test11Module,
    );
  });

  it('swaggerConfigModule no includes ', async () => {
    const swaggerConfigModule: SwaggerService['swaggerConfigModule'] =
      Reflect.get(service, 'swaggerConfigModule');
    const config = await swaggerConfigModule.call(service, {
      open: true,
      path: 'doc',
      documentConfig: [
        {
          module: 'test',
          deepIncludes: true,
          config: new DocumentBuilder()
            .setTitle('接口文档')
            .setDescription('接口文档')
            .setVersion('1.0')
            .build(),
          options: {
            include: [],
          },
        },
      ],
    });
    expect(config).toEqual({
      open: true,
      path: 'doc',
      documentConfig: [
        {
          module: 'test',
          deepIncludes: true,
          config: new DocumentBuilder()
            .setTitle('接口文档')
            .setDescription('接口文档')
            .setVersion('1.0')
            .build(),
          options: {
            include: [],
          },
        },
      ],
    });
  });

  it('swaggerConfigModule no options ', async () => {
    const swaggerConfigModule: SwaggerService['swaggerConfigModule'] =
      Reflect.get(service, 'swaggerConfigModule');
    const config = await swaggerConfigModule.call(service, {
      open: true,
      path: 'doc',
      documentConfig: [
        {
          module: 'test',
          deepIncludes: true,
          config: new DocumentBuilder()
            .setTitle('接口文档')
            .setDescription('接口文档')
            .setVersion('1.0')
            .build(),
        },
      ],
    });
    expect(config).toEqual({
      open: true,
      path: 'doc',
      documentConfig: [
        {
          module: 'test',
          deepIncludes: true,
          config: new DocumentBuilder()
            .setTitle('接口文档')
            .setDescription('接口文档')
            .setVersion('1.0')
            .build(),
        },
      ],
    });
  });

  it('init ', async () => {
    const mockFn = jest.spyOn(NestSwaggerModule, 'setup'); // here we make variable in the scope we have tests
    await service.init(module.createNestApplication());
    expect(mockFn).toHaveBeenCalled(); // here we should be ok
  });
});
