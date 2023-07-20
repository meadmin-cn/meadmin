import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CoreModule } from '@/app/core/core.module';
describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule.forRoot()],
      controllers: [AdminController],
      providers: [AdminService],
    }).compile();

    controller = module.get(AdminController);
    service = module.get(AdminService);
  });
  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
  });
  it('create', async () => {
    const result = { id: 'test' };
    jest.spyOn(service, 'create').mockImplementation(() => result as any);
    const r = await controller.create({} as any);
    expect(r.code).toBe(200);
    expect(r.data).toBe(result);
  });
});
