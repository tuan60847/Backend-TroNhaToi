import { Module } from '@nestjs/common';
import { HopDongService } from './services/hop-dong.service';
import { HopDongController } from './controllers/hop-dong.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    CloudinaryModule
  ],
  controllers: [HopDongController],
  providers: [HopDongService],
  exports: [HopDongService],
})
export class HopDongModule {}
