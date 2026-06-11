import { Module } from '@nestjs/common';
import { NguoiThueService } from './services/nguoi-thue.service';
import { NguoiThueController } from './controllers/nguoi-thue.controller';

@Module({
  controllers: [NguoiThueController],
  providers: [NguoiThueService],
  exports: [NguoiThueService],
})
export class NguoiThueModule {}
