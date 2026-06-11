import { Module } from '@nestjs/common';
import { PhongService } from './services/phong.service';
import { PhongController } from './controllers/phong.controller';

@Module({
  controllers: [PhongController],
  providers: [PhongService],
  exports: [PhongService],
})
export class PhongModule {}
