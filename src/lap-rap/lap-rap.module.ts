import { Module } from '@nestjs/common';
import { LapRapService } from './services/lap-rap.service';
import { LapRapController } from './controllers/lap-rap.controller';

@Module({
  controllers: [LapRapController],
  providers: [LapRapService],
  exports: [LapRapService],
})
export class LapRapModule {}
