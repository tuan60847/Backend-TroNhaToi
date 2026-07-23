import { Module } from '@nestjs/common';
import { LichSuMuaThietBiService } from './services/lich-su-mua-thiet-bi.service';
import { LichSuMuaThietBiController } from './controllers/lich-su-mua-thiet-bi.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LichSuMuaThietBiController],
  providers: [LichSuMuaThietBiService],
  exports: [LichSuMuaThietBiService],
})
export class LichSuMuaThietBiModule {}