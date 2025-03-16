import { Test, TestingModule } from '@nestjs/testing';
import { SeederController } from './seeder.controller';
import { SeederService } from './seeder.service';

describe('SeederController', () => {
  let controller: SeederController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeederController],
      providers: [SeederService],
    }).compile();

    controller = module.get<SeederController>(SeederController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
