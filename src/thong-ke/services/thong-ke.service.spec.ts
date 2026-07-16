import { ThongKeService } from "./thong-ke.service";

describe("ThongKeService snapshot", () => {
  const createService = () => {
    const prisma = {
      thongKeSnapshot: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };

    return {
      prisma,
      service: new ThongKeService(prisma as any),
    };
  };

  it("trả snapshot còn hạn mà không tính lại", async () => {
    const { prisma, service } = createService();
    const duLieu = {
      doanhThu: {
        tongDoanhThu: 1000,
      },
    };

    prisma.thongKeSnapshot.findUnique.mockResolvedValue({
      duLieu,
      hetHanLuc: new Date(Date.now() + 60_000),
    });

    const tinhThongKe = jest.fn();
    (service as any).tinhThongKe = tinhThongKe;

    await expect(
      service.getThongKe({
        nam: 2026,
        thang: 7,
      }),
    ).resolves.toEqual(duLieu);

    expect(prisma.thongKeSnapshot.findUnique).toHaveBeenCalledWith({
      where: {
        kyThongKe: "2026-07",
      },
    });
    expect(tinhThongKe).not.toHaveBeenCalled();
    expect(prisma.thongKeSnapshot.upsert).not.toHaveBeenCalled();
  });

  it("tính và lưu lại khi chưa có snapshot", async () => {
    const { prisma, service } = createService();
    const duLieu = {
      doanhThu: {
        tongDoanhThu: 2000,
      },
      hopDongSapHet: [
        {
          ngayHetHan: new Date("2026-07-31T00:00:00.000Z"),
        },
      ],
    };

    prisma.thongKeSnapshot.findUnique.mockResolvedValue(null);
    prisma.thongKeSnapshot.upsert.mockResolvedValue({});
    (service as any).tinhThongKe = jest.fn().mockResolvedValue(duLieu);

    const result = await service.getThongKe({
      nam: 2026,
    });

    expect(result).toEqual({
      doanhThu: {
        tongDoanhThu: 2000,
      },
      hopDongSapHet: [
        {
          ngayHetHan: "2026-07-31T00:00:00.000Z",
        },
      ],
    });

    expect(prisma.thongKeSnapshot.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          kyThongKe: "2026",
        },
        create: expect.objectContaining({
          kyThongKe: "2026",
          nam: 2026,
          thang: null,
          duLieu: result,
        }),
        update: expect.objectContaining({
          nam: 2026,
          thang: null,
          duLieu: result,
        }),
      }),
    );
  });

  it("tính lại khi snapshot đã hết hạn", async () => {
    const { prisma, service } = createService();

    prisma.thongKeSnapshot.findUnique.mockResolvedValue({
      duLieu: {
        cu: true,
      },
      hetHanLuc: new Date(Date.now() - 1),
    });
    prisma.thongKeSnapshot.upsert.mockResolvedValue({});
    (service as any).tinhThongKe = jest.fn().mockResolvedValue({
      moi: true,
    });

    await expect(
      service.getThongKe({
        nam: 2026,
        thang: 12,
      }),
    ).resolves.toEqual({
      moi: true,
    });

    expect(prisma.thongKeSnapshot.upsert).toHaveBeenCalled();
  });
});
