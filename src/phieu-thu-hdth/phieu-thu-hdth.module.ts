import { Module } from '@nestjs/common';
import { PhieuThuHdThService } from './services/phieu-thu-hdth.service';
import { PhieuThuHdThController } from './controllers/phieu-thu-hdth.controller';
import { ThongKeModule } from '../thong-ke/thong-ke.module';

@Module({
  imports: [ThongKeModule],
  controllers: [PhieuThuHdThController],
  providers: [PhieuThuHdThService],
  exports: [PhieuThuHdThService],
})
export class PhieuThuHdThModule {}
