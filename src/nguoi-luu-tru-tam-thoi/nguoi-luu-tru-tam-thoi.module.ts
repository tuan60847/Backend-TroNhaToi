import { Module } from '@nestjs/common';
import { NguoiLuuTruTamThoiService } from './services/nguoi-luu-tru-tam-thoi.service';
import { NguoiLuuTruTamThoiController } from './controllers/nguoi-luu-tru-tam-thoi.controller';

@Module({
  controllers: [NguoiLuuTruTamThoiController],
  providers: [NguoiLuuTruTamThoiService],
  exports: [NguoiLuuTruTamThoiService],
})
export class NguoiLuuTruTamThoiModule {}
