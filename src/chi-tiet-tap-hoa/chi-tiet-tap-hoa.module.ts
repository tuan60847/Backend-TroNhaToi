import { Module } from '@nestjs/common';
import { ChiTietTapHoaService } from './services/chi-tiet-tap-hoa.service';
import { ChiTietTapHoaController } from './controllers/chi-tiet-tap-hoa.controller';
import { ThongKeModule } from '../thong-ke/thong-ke.module';

@Module({
  imports: [ThongKeModule],
  controllers: [ChiTietTapHoaController],
  providers: [ChiTietTapHoaService],
  exports: [ChiTietTapHoaService],
})
export class ChiTietTapHoaModule {}
