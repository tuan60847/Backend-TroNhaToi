import { Module } from '@nestjs/common';
import { ChiTietTapHoaService } from './services/chi-tiet-tap-hoa.service';
import { ChiTietTapHoaController } from './controllers/chi-tiet-tap-hoa.controller';

@Module({
  controllers: [ChiTietTapHoaController],
  providers: [ChiTietTapHoaService],
  exports: [ChiTietTapHoaService],
})
export class ChiTietTapHoaModule {}
