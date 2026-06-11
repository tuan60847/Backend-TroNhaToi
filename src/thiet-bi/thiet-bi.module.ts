import { Module } from '@nestjs/common';
import { ThietBiService } from './services/thiet-bi.service';
import { ThietBiController } from './controllers/thiet-bi.controller';

@Module({
  controllers: [ThietBiController],
  providers: [ThietBiService],
  exports: [ThietBiService],
})
export class ThietBiModule {}
