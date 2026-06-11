import { Module } from '@nestjs/common';
import { HopDongService } from './services/hop-dong.service';
import { HopDongController } from './controllers/hop-dong.controller';

@Module({
  controllers: [HopDongController],
  providers: [HopDongService],
  exports: [HopDongService],
})
export class HopDongModule {}
