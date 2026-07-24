import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type SnapshotClient = Prisma.TransactionClient | PrismaService;

@Injectable()
export class ThongKeSnapshotService {
  constructor(private readonly prisma: PrismaService) {}

  async invalidateAll(client: SnapshotClient = this.prisma): Promise<void> {
    await client.thongKeRevision.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        phienBan: 1,
      },
      update: {
        phienBan: {
          increment: 1,
        },
      },
    });
    await client.thongKeSnapshot.deleteMany();
  }
}
