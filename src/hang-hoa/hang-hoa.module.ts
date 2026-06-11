import { Module } from '@nestjs/common';
import { HangHoaService } from './services/hang-hoa.service';
import { HangHoaController } from './controllers/hang-hoa.controller';

@Module({
  controllers: [HangHoaController],
  providers: [HangHoaService],
  exports: [HangHoaService],
})
export class HangHoaModule {}
