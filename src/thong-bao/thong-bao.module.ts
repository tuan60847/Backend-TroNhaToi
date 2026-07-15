import { Module } from '@nestjs/common';
import { ThongBaoController } from './controllers/thong-bao.controller';
import { ThongBaoGateway } from './gateways/thong-bao.gateway';
import { HopDongJobService } from './services/hop-dong-job.service';
import { ThongBaoService } from './services/thong-bao.service';

@Module({
  controllers: [ThongBaoController],
  providers: [ThongBaoGateway, ThongBaoService, HopDongJobService],
  exports: [ThongBaoService],
})
export class ThongBaoModule {}
