import { Module } from '@nestjs/common';
import { LichSuMuaThietBiService } from './services/lich-su-mua-thiet-bi.service';
import { LichSuMuaThietBiController } from './controllers/lich-su-mua-thiet-bi.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ThongKeModule } from '../thong-ke/thong-ke.module';

@Module({
  imports: [PrismaModule, ThongKeModule],
  controllers: [LichSuMuaThietBiController],
  providers: [LichSuMuaThietBiService],
  exports: [LichSuMuaThietBiService],
})
export class LichSuMuaThietBiModule {}
