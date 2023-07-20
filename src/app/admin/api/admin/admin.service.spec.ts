import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Admin } from './entities/admin.entity';
import { CoreModule } from '@/app/core/core.module';

describe('AdminService', () => {
  let service: AdminService;
  let id: number;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule.forRoot()],
      providers: [AdminService],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('admin create', async () => {
    const createInfo = {
      username: '123456',
      avatar: '',
      nickname: 'test',
      password: '123456',
      email: '479820787@qq.com',
      mobile: '15563556250',
      status: 1,
    };
    const info = await service.create(createInfo);
    id = info.id;
    const row = await Admin.findOneBy({ id: info.id });
    expect(
      service.checkPassword(createInfo.password, row!.salt, row!.password),
    ).toBe(true);
    expect(row).toEqual(
      expect.objectContaining(
        Object.assign({}, createInfo, { password: row?.password }),
      ),
    );
  });
  it('admin update', async () => {
    const updateInfo = {
      username: '7890',
    };
    const info = await service.update(id, updateInfo);
    const row = await Admin.findOneBy({ id: id });
    expect(row?.username).toBe(updateInfo.username);
    const updateInfo2 = {
      password: '123456',
    };
    await service.update(id, updateInfo2);
    const row2 = await Admin.findOneBy({ id: info.id });
    expect(
      service.checkPassword(updateInfo2.password, row!.salt, row2!.password),
    ).toBe(true);
  });
});
