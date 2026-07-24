import { Module } from '@nestjs/common';
import { HoaDonGuiXeService } from './services/hoa-don-gui-xe.service';
import { HoaDonGuiXeController } from './controllers/hoa-don-gui-xe.controller';
import { ThongKeModule } from '../thong-ke/thong-ke.module';

@Module({
  imports: [ThongKeModule],
  controllers: [HoaDonGuiXeController],
  providers: [HoaDonGuiXeService],
  exports: [HoaDonGuiXeService],
})
export class HoaDonGuiXeModule {}
