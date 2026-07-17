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
      topPhong: [],
      topCongNo: [],
      topHangHoa: [],
      topThietBiSua: [],
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

  it("tính lại snapshot cũ chưa có dữ liệu Top", async () => {
    const { prisma, service } = createService();

    prisma.thongKeSnapshot.findUnique.mockResolvedValue({
      duLieu: { doanhThu: {} },
      hetHanLuc: new Date(Date.now() + 60_000),
    });
    prisma.thongKeSnapshot.upsert.mockResolvedValue({});
    (service as any).tinhThongKe = jest.fn().mockResolvedValue({
      topPhong: [],
      topCongNo: [],
      topHangHoa: [],
      topThietBiSua: [],
    });

    await service.getThongKe({ nam: 2026 });

    expect((service as any).tinhThongKe).toHaveBeenCalled();
    expect(prisma.thongKeSnapshot.upsert).toHaveBeenCalled();
  });
});

describe("ThongKeService Top 5", () => {
  const createService = () => {
    const prisma = {
      hoaDonPhong: { findMany: jest.fn() },
      hoaDonTapHoa: { findMany: jest.fn() },
      suaChua: { findMany: jest.fn() },
    };

    return {
      prisma,
      service: new ThongKeService(prisma as any),
    };
  };

  it("xếp hạng phòng theo doanh thu", async () => {
    const { prisma, service } = createService();
    prisma.hoaDonPhong.findMany.mockResolvedValue([
      {
        soTien: 1000,
        phieuThuHangThang: [{ soTien: 400 }],
        hopdong: { phong: { phongId: 1, tenPhong: "P101" } },
      },
      {
        soTien: 2000,
        phieuThuHangThang: [{ soTien: 2000 }],
        hopdong: { phong: { phongId: 2, tenPhong: "P102" } },
      },
    ]);

    await expect(
      (service as any).getTopPhong({ nam: 2026 }),
    ).resolves.toEqual([
      {
        phongId: 2,
        tenPhong: "P102",
        tongDoanhThu: 2000,
        tongDaThu: 2000,
        tongCongNo: 0,
      },
      {
        phongId: 1,
        tenPhong: "P101",
        tongDoanhThu: 1000,
        tongDaThu: 400,
        tongCongNo: 600,
      },
    ]);
  });

  it("gộp công nợ phòng và tạp hóa theo người thuê", async () => {
    const { prisma, service } = createService();
    prisma.hoaDonPhong.findMany.mockResolvedValue([
      {
        soTien: 1000,
        phieuThuHangThang: [{ soTien: 200 }],
        hopdong: { nguoithue: { idnt: 1, hoTen: "Nguyễn A" } },
      },
    ]);
    prisma.hoaDonTapHoa.findMany.mockResolvedValue([
      {
        tongTien: 500,
        phieuThuHdTh: [{ soTien: 100 }],
        nguoiThue: { idnt: 1, hoTen: "Nguyễn A" },
      },
    ]);

    await expect(
      (service as any).getTopCongNo({ nam: 2026, thang: 7 }),
    ).resolves.toEqual([
      {
        idnt: 1,
        hoTen: "Nguyễn A",
        tongTien: 1500,
        tongDaThu: 300,
        tongCongNo: 1200,
      },
    ]);
  });

  it("tính công nợ sau khi tổng hợp, không chặn từng hóa đơn", async () => {
    const { prisma, service } = createService();
    prisma.hoaDonPhong.findMany.mockResolvedValue([
      {
        soTien: 100,
        phieuThuHangThang: [{ soTien: 150 }],
        hopdong: { nguoithue: { idnt: 1, hoTen: "Nguyễn A" } },
      },
      {
        soTien: 100,
        phieuThuHangThang: [],
        hopdong: { nguoithue: { idnt: 1, hoTen: "Nguyễn A" } },
      },
    ]);
    prisma.hoaDonTapHoa.findMany.mockResolvedValue([]);

    await expect(
      (service as any).getTopCongNo({ nam: 2026 }),
    ).resolves.toEqual([
      {
        idnt: 1,
        hoTen: "Nguyễn A",
        tongTien: 200,
        tongDaThu: 150,
        tongCongNo: 50,
      },
    ]);
  });

  it("xếp hạng hàng hóa theo tổng số lượng", async () => {
    const { prisma, service } = createService();
    prisma.hoaDonTapHoa.findMany.mockResolvedValue([
      {
        chiTietTapHoa: [
          {
            soLuong: 3,
            hangHoa: {
              maHangHoa: 1,
              tenHangHoa: "Nước",
              donViTinh: "chai",
              isDelete: false,
            },
          },
        ],
      },
    ]);

    await expect(
      (service as any).getTopHangHoa({ nam: 2026 }),
    ).resolves.toEqual([
      {
        maHangHoa: 1,
        tenHangHoa: "Nước",
        donViTinh: "chai",
        tongSoLuong: 3,
      },
    ]);
  });

  it("xếp hạng thiết bị theo số lần sửa", async () => {
    const { prisma, service } = createService();
    prisma.suaChua.findMany.mockResolvedValue([
      {
        thietbi: {
          thietBiId: 1,
          tenThietBi: "Máy lạnh",
          loai: "Điện lạnh",
          isDelete: false,
        },
      },
      {
        thietbi: {
          thietBiId: 1,
          tenThietBi: "Máy lạnh",
          loai: "Điện lạnh",
          isDelete: false,
        },
      },
    ]);

    await expect(
      (service as any).getTopThietBiSua({ nam: 2026 }),
    ).resolves.toEqual([
      {
        thietBiId: 1,
        tenThietBi: "Máy lạnh",
        loai: "Điện lạnh",
        soLanSua: 2,
      },
    ]);
  });
});
