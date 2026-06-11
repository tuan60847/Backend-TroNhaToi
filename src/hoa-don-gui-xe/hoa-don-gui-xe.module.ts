import { Module } from '@nestjs/common';
import { HoaDonGuiXeService } from './services/hoa-don-gui-xe.service';
import { HoaDonGuiXeController } from './controllers/hoa-don-gui-xe.controller';

@Module({
  controllers: [HoaDonGuiXeController],
  providers: [HoaDonGuiXeService],
  exports: [HoaDonGuiXeService],
})
export class HoaDonGuiXeModule {}
