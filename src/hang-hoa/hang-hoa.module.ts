import { Module } from '@nestjs/common';
import { HangHoaService } from './services/hang-hoa.service';
import { HangHoaController } from './controllers/hang-hoa.controller';
import { ThongKeModule } from '../thong-ke/thong-ke.module';

@Module({
  imports: [ThongKeModule],
  controllers: [HangHoaController],
  providers: [HangHoaService],
  exports: [HangHoaService],
})
export class HangHoaModule {}
