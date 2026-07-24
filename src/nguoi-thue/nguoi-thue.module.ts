import { Module } from '@nestjs/common';
import { NguoiThueService } from './services/nguoi-thue.service';
import { NguoiThueController } from './controllers/nguoi-thue.controller';
import { ThongKeModule } from '../thong-ke/thong-ke.module';

@Module({
  imports: [ThongKeModule],
  controllers: [NguoiThueController],
  providers: [NguoiThueService],
  exports: [NguoiThueService],
})
export class NguoiThueModule {}
