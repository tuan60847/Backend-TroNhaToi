import { Module } from '@nestjs/common';
import { PhongService } from './services/phong.service';
import { PhongController } from './controllers/phong.controller';
import { ThongKeModule } from '../thong-ke/thong-ke.module';

@Module({
  imports: [ThongKeModule],
  controllers: [PhongController],
  providers: [PhongService],
  exports: [PhongService],
})
export class PhongModule {}
