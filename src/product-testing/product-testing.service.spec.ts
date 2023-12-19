import { Test, TestingModule } from '@nestjs/testing';
import { ProductTestingService } from './product-testing.service';

describe('ProductTestingService', () => {
  let service: ProductTestingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductTestingService],
    }).compile();

    service = module.get<ProductTestingService>(ProductTestingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
