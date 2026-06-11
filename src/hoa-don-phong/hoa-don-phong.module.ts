import { Module } from '@nestjs/common';
import { HoaDonPhongService } from './services/hoa-don-phong.service';
import { HoaDonPhongController } from './controllers/hoa-don-phong.controller';

@Module({
  controllers: [HoaDonPhongController],
  providers: [HoaDonPhongService],
  exports: [HoaDonPhongService],
})
export class HoaDonPhongModule {}
