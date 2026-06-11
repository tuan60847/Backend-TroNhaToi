import { Module } from '@nestjs/common';
import { PhieuThuHangThangService } from './services/phieu-thu-hang-thang.service';
import { PhieuThuHangThangController } from './controllers/phieu-thu-hang-thang.controller';

@Module({
  controllers: [PhieuThuHangThangController],
  providers: [PhieuThuHangThangService],
  exports: [PhieuThuHangThangService],
})
export class PhieuThuHangThangModule {}
