import { Module } from '@nestjs/common';
import { HoaDonSuaChuaService } from './services/hoa-don-sua-chua.service';
import { HoaDonSuaChuaController } from './controllers/hoa-don-sua-chua.controller';

@Module({
  controllers: [HoaDonSuaChuaController],
  providers: [HoaDonSuaChuaService],
  exports: [HoaDonSuaChuaService],
})
export class HoaDonSuaChuaModule {}
