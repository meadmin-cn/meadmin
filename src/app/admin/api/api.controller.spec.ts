import { Test, TestingModule } from '@nestjs/testing';
import { AdminApiController } from './api.controller';
import { CoreModule } from '@/app/core/core.module';

describe('AdminApiController', () => {
  let controller: AdminApiController;

  beforeEach(async () => {
    class AdminApiActualController extends AdminApiController {}
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule.forRoot()],
      controllers: [AdminApiActualController],
    }).compile();

    controller = module.get<AdminApiController>(AdminApiActualController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
