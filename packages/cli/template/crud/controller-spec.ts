import { Test, TestingModule } from '@nestjs/testing';
import { __Name__Controller } from './__-name__.controller';
import { __Name__Service } from './__-name__.service';

describe('__Name__Controller', () => {
  let controller: __Name__Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [__Name__Controller],
      providers: [__Name__Service],
    }).compile();

    controller = module.get<__Name__Controller>(__Name__Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
