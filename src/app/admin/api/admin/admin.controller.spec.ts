import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CoreModule } from '@/app/core/core.module';
describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;
  beforeAll(async () => {
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
  it('findAll', async () => {
    const result = [] as any[];
    const count = 0;
    jest.spyOn(service, 'findAll').mockImplementation(() => result as any);
    jest.spyOn(service, 'count').mockImplementation(() => count as any);
    const r = await controller.findAll({} as any);
    expect(r.code).toBe(200);
    expect(r.data.list).toBe(result);
    expect(r.data.total).toBe(count);
  });
  it('findOne', async () => {
    const result = { id: 'test' };
    jest.spyOn(service, 'findOne').mockImplementation(() => result as any);
    const r = await controller.findOne(1);
    expect(r.code).toBe(200);
    expect(r.data).toBe(result);
  });
  it('update', async () => {
    const result = { id: 'test' };
    jest.spyOn(service, 'update').mockImplementation(() => result as any);
    const r = await controller.update(1, {} as any);
    expect(r.code).toBe(200);
    expect(r.data).toBe(result);
  });
  it('remove', async () => {
    const drink = jest
      .spyOn(service, 'remove')
      .mockImplementation(() => true as any);
    const r = await controller.remove(1);
    expect(r.code).toBe(200);
    expect(drink).toHaveBeenCalledTimes(1);
  });
});
