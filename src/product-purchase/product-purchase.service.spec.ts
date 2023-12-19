import { Test, TestingModule } from '@nestjs/testing';
import { ProductPurchaseService } from './product-purchase.service';

describe('ProductPurchaseService', () => {
  let service: ProductPurchaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductPurchaseService],
    }).compile();

    service = module.get<ProductPurchaseService>(ProductPurchaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
