import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ThongKeController } from './controllers/thong-ke.controller';
import { ThongKeService } from './services/thong-ke.service';

@Module({
  imports: [PrismaModule],
  controllers: [ThongKeController],
  providers: [ThongKeService],
  exports: [ThongKeService],
})
export class ThongKeModule {}