import { Test, TestingModule } from '@nestjs/testing';
import { EngineerHistoryService } from './engineer-history.service';

describe('EngineerHistoryService', () => {
  let service: EngineerHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EngineerHistoryService],
    }).compile();

    service = module.get<EngineerHistoryService>(EngineerHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
