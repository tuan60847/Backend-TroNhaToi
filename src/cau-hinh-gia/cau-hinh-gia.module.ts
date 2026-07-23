import { Module } from '@nestjs/common';
import { CauHinhGiaController } from './controllers/cau-hinh-gia.controller';
import { CauHinhGiaService } from './services/cau-hinh-gia.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CauHinhGiaController],
  providers: [CauHinhGiaService]
})
export class CauHinhGiaModule {}
