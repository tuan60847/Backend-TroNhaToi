import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ThongKeController } from './controllers/thong-ke.controller';
import { ThongKeSnapshotService } from './services/thong-ke-snapshot.service';
import { ThongKeService } from './services/thong-ke.service';

@Module({
  imports: [PrismaModule],
  controllers: [ThongKeController],
  providers: [ThongKeService, ThongKeSnapshotService],
  exports: [ThongKeService, ThongKeSnapshotService],
})
export class ThongKeModule {}
