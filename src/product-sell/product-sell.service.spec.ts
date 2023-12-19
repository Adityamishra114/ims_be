import { Test, TestingModule } from '@nestjs/testing';
import { ProductSellService } from './product-sell.service';

describe('ProductSellService', () => {
  let service: ProductSellService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductSellService],
    }).compile();

    service = module.get<ProductSellService>(ProductSellService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
