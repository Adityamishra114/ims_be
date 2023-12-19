import { Test, TestingModule } from '@nestjs/testing';
import { CatPhaseService } from './cat-phase.service';

describe('CatPhaseService', () => {
  let service: CatPhaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatPhaseService],
    }).compile();

    service = module.get<CatPhaseService>(CatPhaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
