import { Test, TestingModule } from '@nestjs/testing';
import { AdminApiController } from './api.controller';

describe('AdminApiController', () => {
  let controller: AdminApiController;

  beforeEach(async () => {
    class AdminApiActualController extends AdminApiController {}
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminApiActualController],
    }).compile();

    controller = module.get<AdminApiController>(AdminApiActualController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
