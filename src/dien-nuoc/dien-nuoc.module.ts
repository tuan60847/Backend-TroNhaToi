import { Module } from '@nestjs/common';
import { DienNuocService } from './services/dien-nuoc.service';
import { DienNuocController } from './controllers/dien-nuoc.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
   imports: [
      CloudinaryModule
    ],
  controllers: [DienNuocController],
  providers: [DienNuocService],
  exports: [DienNuocService],
})
export class DienNuocModule {}
