import { Test, TestingModule } from '@nestjs/testing';
import { ProductTestingController } from './product-testing.controller';
import { ProductTestingService } from './product-testing.service';

describe('ProductTestingController', () => {
  let controller: ProductTestingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductTestingController],
      providers: [ProductTestingService],
    }).compile();

    controller = module.get<ProductTestingController>(ProductTestingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
