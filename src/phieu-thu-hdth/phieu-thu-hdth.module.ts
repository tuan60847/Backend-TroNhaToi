import { Module } from '@nestjs/common';
import { PhieuThuHdThService } from './services/phieu-thu-hdth.service';
import { PhieuThuHdThController } from './controllers/phieu-thu-hdth.controller';

@Module({
  controllers: [PhieuThuHdThController],
  providers: [PhieuThuHdThService],
  exports: [PhieuThuHdThService],
})
export class PhieuThuHdThModule {}
