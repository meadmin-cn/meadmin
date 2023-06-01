import { Test, TestingModule } from '@nestjs/testing';
import { __Name__Service } from './__-name__.service';

describe('__Name__Service', () => {
  let service: __Name__Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [__Name__Service],
    }).compile();

    service = module.get<__Name__Service>(__Name__Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
