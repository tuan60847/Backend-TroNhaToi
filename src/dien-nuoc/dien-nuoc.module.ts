import { Module } from '@nestjs/common';
import { DienNuocService } from './services/dien-nuoc.service';
import { DienNuocController } from './controllers/dien-nuoc.controller';

@Module({
  controllers: [DienNuocController],
  providers: [DienNuocService],
  exports: [DienNuocService],
})
export class DienNuocModule {}
