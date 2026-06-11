import { Module } from '@nestjs/common';
import { LoaiPhongService } from './services/loai-phong.service';
import { LoaiPhongController } from './controllers/loai-phong.controller';

@Module({
  controllers: [LoaiPhongController],
  providers: [LoaiPhongService],
  exports: [LoaiPhongService],
})
export class LoaiPhongModule {}
