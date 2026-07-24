import { ThongKeService } from "./thong-ke.service";

describe("ThongKeService snapshot", () => {
  const createService = () => {
    const prisma: any = {
      thongKeRevision: {
        findUnique: jest.fn().mockResolvedValue({ phienBan: 0 }),
        upsert: jest.fn().mockResolvedValue({ phienBan: 0 }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      thongKeSnapshot: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    prisma.$transaction = jest.fn(async (callback) => callback(prisma));

    return {
      prisma,
      service: new ThongKeService(prisma as any),
    };
  };

  it("trả snapshot hiện có mà không tính lại", async () => {
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
      phienBan: 0,
    });

    const tinhThongKe = jest.fn();
    (service as any).tinhThongKe = tinhThongKe;
    (service as any).refreshTimeDependentData = jest
      .fn()
      .mockResolvedValue(duLieu);

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
    expect((service as any).refreshTimeDependentData).toHaveBeenCalledWith(
      duLieu,
    );
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
          phienBan: 0,
          duLieu: result,
        }),
        update: expect.objectContaining({
          nam: 2026,
          thang: null,
          phienBan: 0,
          duLieu: result,
        }),
      }),
    );
  });

  it("tính lại snapshot cũ chưa có dữ liệu Top", async () => {
    const { prisma, service } = createService();

    prisma.thongKeSnapshot.findUnique.mockResolvedValue({
      duLieu: { doanhThu: {} },
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

  it("không lưu kết quả cũ nếu revision đổi trong lúc tính", async () => {
    const { prisma, service } = createService();

    prisma.thongKeRevision.findUnique
      .mockResolvedValueOnce({ phienBan: 0 })
      .mockResolvedValueOnce({ phienBan: 1 });
    prisma.thongKeRevision.updateMany
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ count: 1 });
    prisma.thongKeSnapshot.findUnique.mockResolvedValue(null);
    prisma.thongKeSnapshot.upsert.mockResolvedValue({});
    (service as any).tinhThongKe = jest
      .fn()
      .mockResolvedValueOnce({
        topPhong: [],
        topCongNo: [],
        topHangHoa: [],
        topThietBiSua: [],
        marker: "cu",
      })
      .mockResolvedValueOnce({
        topPhong: [],
        topCongNo: [],
        topHangHoa: [],
        topThietBiSua: [],
        marker: "moi",
      });

    await expect(service.getThongKe({ nam: 2026 })).resolves.toEqual(
      expect.objectContaining({ marker: "moi" }),
    );

    expect((service as any).tinhThongKe).toHaveBeenCalledTimes(2);
    expect(prisma.thongKeSnapshot.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.thongKeSnapshot.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ phienBan: 1 }),
        update: expect.objectContaining({ phienBan: 1 }),
      }),
    );
  });

  it("xóa snapshot cũ khi khởi tạo revision lần đầu", async () => {
    const { prisma, service } = createService();
    const oldSnapshot = {
      phienBan: 0,
      duLieu: {
        topPhong: [],
        topCongNo: [],
        topHangHoa: [],
        topThietBiSua: [],
        marker: "cu",
      },
    };

    prisma.thongKeRevision.findUnique.mockResolvedValue(null);
    prisma.thongKeRevision.upsert.mockResolvedValue({ phienBan: 0 });
    prisma.thongKeSnapshot.findUnique.mockResolvedValue(oldSnapshot);
    prisma.thongKeSnapshot.upsert.mockResolvedValue({});
    (service as any).tinhThongKe = jest.fn().mockResolvedValue({
      topPhong: [],
      topCongNo: [],
      topHangHoa: [],
      topThietBiSua: [],
      marker: "moi",
    });

    await expect(service.getThongKe({ nam: 2026 })).resolves.toEqual(
      expect.objectContaining({ marker: "moi" }),
    );

    expect(prisma.thongKeSnapshot.deleteMany).toHaveBeenCalledTimes(1);
    expect((service as any).tinhThongKe).toHaveBeenCalledTimes(1);
  });

  it("tính lại các phần phụ thuộc ngày khi trả snapshot", async () => {
    const { service } = createService();
    (service as any).getThongKePhong = jest.fn().mockResolvedValue({
      phongDangThue: 2,
    });
    (service as any).getThongKeNguoiThue = jest.fn().mockResolvedValue({
      hopDongSapHet: 1,
    });
    (service as any).getHopDongSapHet = jest.fn().mockResolvedValue([
      { hopDongId: "HD001" },
    ]);

    await expect(
      (service as any).refreshTimeDependentData({
        doanhThu: { tongDoanhThu: 1000 },
        phong: { phongDangThue: 0 },
      }),
    ).resolves.toEqual({
      doanhThu: { tongDoanhThu: 1000 },
      phong: { phongDangThue: 2 },
      nguoiThue: { hopDongSapHet: 1 },
      hopDongSapHet: [{ hopDongId: "HD001" }],
    });
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
