import { Module } from '@nestjs/common';
import { HopDongService } from './services/hop-dong.service';
import { HopDongController } from './controllers/hop-dong.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ThongKeModule } from '../thong-ke/thong-ke.module';

@Module({
  imports: [
    CloudinaryModule,
    ThongKeModule,
  ],
  controllers: [HopDongController],
  providers: [HopDongService],
  exports: [HopDongService],
})
export class HopDongModule {}
