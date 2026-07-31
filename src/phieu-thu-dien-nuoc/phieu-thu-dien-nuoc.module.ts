import { Module } from '@nestjs/common';
import { PhieuThuDienNuocService } from './services/phieu-thu-dien-nuoc.service';
import { PhieuThuDienNuocController } from './controllers/phieu-thu-dien-nuoc.controller';

@Module({
  controllers: [PhieuThuDienNuocController],
  providers: [PhieuThuDienNuocService],
  exports: [PhieuThuDienNuocService],
})
export class PhieuThuDienNuocModule {}