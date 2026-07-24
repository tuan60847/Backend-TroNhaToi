import { Module } from '@nestjs/common';
import { ThietBiService } from './services/thiet-bi.service';
import { ThietBiController } from './controllers/thiet-bi.controller';
import { ThongKeModule } from '../thong-ke/thong-ke.module';

@Module({
  imports: [ThongKeModule],
  controllers: [ThietBiController],
  providers: [ThietBiService],
  exports: [ThietBiService],
})
export class ThietBiModule {}
