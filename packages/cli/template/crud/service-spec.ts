import { Test, TestingModule } from '@nestjs/testing';
import { __Service__ } from '__-service__';

describe('__Service__', () => {
  let service: __Service__;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [__Service__],
    }).compile();

    service = module.get<__Service__>(__Service__);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
