import { Test, TestingModule } from '@nestjs/testing';
import { CauHinhGiaService } from '../services/cau-hinh-gia.service';
import { before, describe, it } from 'node:test';
describe('CauHinhGiaService', () => {
  let service: CauHinhGiaService;

  before(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CauHinhGiaService],
    }).compile();

    service = module.get<CauHinhGiaService>(CauHinhGiaService);
  });

  
});
