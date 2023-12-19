import { Test, TestingModule } from '@nestjs/testing';
import { CatPhaseController } from './cat-phase.controller';
import { CatPhaseService } from './cat-phase.service';

describe('CatPhaseController', () => {
  let controller: CatPhaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatPhaseController],
      providers: [CatPhaseService],
    }).compile();

    controller = module.get<CatPhaseController>(CatPhaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
