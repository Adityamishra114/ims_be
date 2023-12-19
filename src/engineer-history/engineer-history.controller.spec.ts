import { Test, TestingModule } from '@nestjs/testing';
import { EngineerHistoryController } from './engineer-history.controller';
import { EngineerHistoryService } from './engineer-history.service';

describe('EngineerHistoryController', () => {
  let controller: EngineerHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EngineerHistoryController],
      providers: [EngineerHistoryService],
    }).compile();

    controller = module.get<EngineerHistoryController>(EngineerHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
