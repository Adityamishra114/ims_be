import { Test, TestingModule } from '@nestjs/testing';
import { ProductPurchaseController } from './product-purchase.controller';
import { ProductPurchaseService } from './product-purchase.service';

describe('ProductPurchaseController', () => {
  let controller: ProductPurchaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductPurchaseController],
      providers: [ProductPurchaseService],
    }).compile();

    controller = module.get<ProductPurchaseController>(ProductPurchaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
