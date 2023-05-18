import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { ControllerService } from './controller.service';
import { DiscoveryService } from './discovery.service';
import { SwaggerService } from './swagger.service';

describe('AppService', () => {
  let service: AppService;
  let module: TestingModule;
  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AppService,
        ControllerService,
        SwaggerService,
        DiscoveryService,
      ],
    }).compile();
    service = module.get(AppService);
  });
  describe('on App Created', () => {
    it('controller init 应该被调用', async () => {
      const mockFn = jest.spyOn(
        module.get<ControllerService>(ControllerService),
        'init',
      );
      await service.onAppCreated(module.createNestApplication());
      expect(mockFn).toHaveBeenCalled();
    });
    it('swagger init 应该被调用', async () => {
      const mockFn = jest.spyOn(
        module.get<SwaggerService>(SwaggerService),
        'init',
      );
      await service.onAppCreated(module.createNestApplication());
      expect(mockFn).toHaveBeenCalled();
    });
  });
});
