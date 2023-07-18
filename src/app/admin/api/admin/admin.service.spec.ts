import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Admin } from './entities/admin.entity';
import { CoreModule } from '@/app/core/core.module';

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule.forRoot()],
      providers: [AdminService],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('admin create', () => {
    const createInfo = {
      username: '123456',
      nickname: 'test',
      password: '123456',
      email: '479820787@qq.com',
      mobile: '15563556250',
      status: '1',
    };
    console.log('createInfo', JSON.stringify(createInfo));
    expect(service.create(createInfo)).toBeDefined();
  });
});
