import { Module } from '@nestjs/common';
import { PhieuThuHangThangService } from './services/phieu-thu-hang-thang.service';
import { PhieuThuHangThangController } from './controllers/phieu-thu-hang-thang.controller';
import { ThongKeModule } from '../thong-ke/thong-ke.module';

@Module({
  imports: [ThongKeModule],
  controllers: [PhieuThuHangThangController],
  providers: [PhieuThuHangThangService],
  exports: [PhieuThuHangThangService],
})
export class PhieuThuHangThangModule {}
