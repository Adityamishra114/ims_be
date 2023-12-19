import { Test, TestingModule } from '@nestjs/testing';
import { ProductSellController } from './product-sell.controller';
import { ProductSellService } from './product-sell.service';

describe('ProductSellController', () => {
  let controller: ProductSellController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductSellController],
      providers: [ProductSellService],
    }).compile();

    controller = module.get<ProductSellController>(ProductSellController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
