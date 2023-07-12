import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryService } from './discovery.service';
import { SwaggerService } from './swagger.service';
import { NestSwaggerModule } from '@meadmin/nest-swagger';

describe('SwaggerService', () => {
  let service: SwaggerService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [SwaggerService, DiscoveryService, Reflector],
    }).compile();
    service = module.get<SwaggerService>(SwaggerService);
  });

  it('init ', async () => {
    const mockFn = jest.spyOn(NestSwaggerModule, 'setup'); // here we make variable in the scope we have tests
    await service.init(module.createNestApplication());
    expect(mockFn).toHaveBeenCalled(); // here we should be ok
  });
});
