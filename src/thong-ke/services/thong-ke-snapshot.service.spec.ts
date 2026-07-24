import { ThongKeSnapshotService } from './thong-ke-snapshot.service';

describe('ThongKeSnapshotService', () => {
  it('xóa toàn bộ snapshot bằng client mặc định', async () => {
    const prisma = {
      thongKeRevision: {
        upsert: jest.fn().mockResolvedValue({ id: 1, phienBan: 1 }),
      },
      thongKeSnapshot: {
        deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    const service = new ThongKeSnapshotService(prisma as any);

    await service.invalidateAll();

    expect(prisma.thongKeRevision.upsert).toHaveBeenCalledWith({
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
    expect(prisma.thongKeSnapshot.deleteMany).toHaveBeenCalledTimes(1);
  });

  it('xóa snapshot bằng transaction client được truyền vào', async () => {
    const prisma = {
      thongKeRevision: {
        upsert: jest.fn(),
      },
      thongKeSnapshot: {
        deleteMany: jest.fn(),
      },
    };
    const transactionClient = {
      thongKeRevision: {
        upsert: jest.fn().mockResolvedValue({ id: 1, phienBan: 2 }),
      },
      thongKeSnapshot: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = new ThongKeSnapshotService(prisma as any);

    await service.invalidateAll(transactionClient as any);

    expect(transactionClient.thongKeRevision.upsert).toHaveBeenCalledTimes(1);
    expect(transactionClient.thongKeSnapshot.deleteMany).toHaveBeenCalledTimes(1);
    expect(prisma.thongKeRevision.upsert).not.toHaveBeenCalled();
    expect(prisma.thongKeSnapshot.deleteMany).not.toHaveBeenCalled();
  });
});
