import { Module } from '@nestjs/common';
import { LapRapService } from './services/lap-rap.service';
import { LapRapController } from './controllers/lap-rap.controller';
import { ThongKeModule } from '../thong-ke/thong-ke.module';

@Module({
  imports: [ThongKeModule],
  controllers: [LapRapController],
  providers: [LapRapService],
  exports: [LapRapService],
})
export class LapRapModule {}
