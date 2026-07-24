import { Module } from '@nestjs/common';
import { HoaDonPhongService } from './services/hoa-don-phong.service';
import { HoaDonPhongController } from './controllers/hoa-don-phong.controller';
import { ThongKeModule } from '../thong-ke/thong-ke.module';

@Module({
  imports: [ThongKeModule],
  controllers: [HoaDonPhongController],
  providers: [HoaDonPhongService],
  exports: [HoaDonPhongService],
})
export class HoaDonPhongModule {}
