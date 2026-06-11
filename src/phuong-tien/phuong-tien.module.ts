import { Module } from '@nestjs/common';
import { PhuongTienService } from './services/phuong-tien.service';
import { PhuongTienController } from './controllers/phuong-tien.controller';

@Module({
  controllers: [PhuongTienController],
  providers: [PhuongTienService],
  exports: [PhuongTienService],
})
export class PhuongTienModule {}
