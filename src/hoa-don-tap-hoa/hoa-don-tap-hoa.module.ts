import { Module } from '@nestjs/common';
import { HoaDonTapHoaService } from './services/hoa-don-tap-hoa.service';
import { HoaDonTapHoaController } from './controllers/hoa-don-tap-hoa.controller';
import { ThongKeModule } from '../thong-ke/thong-ke.module';

@Module({
  imports: [ThongKeModule],
  controllers: [HoaDonTapHoaController],
  providers: [HoaDonTapHoaService],
  exports: [HoaDonTapHoaService],
})
export class HoaDonTapHoaModule {}
