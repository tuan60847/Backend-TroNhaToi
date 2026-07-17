import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ThongKeQueryDto } from "../dto/thong-ke-query.dto";

@Injectable()
export class ThongKeService {
  private readonly snapshotTtlMs = 5 * 60 * 1000;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * ==========================================
   * HÀM HỖ TRỢ
   * ==========================================
   */

  /**
   * ==========================================
   * DECIMAL -> NUMBER
   * ==========================================
   */
  private toNumber(value: Prisma.Decimal | number | null | undefined): number {
    if (value === null || value === undefined) {
      return 0;
    }

    return Number(value);
  }

  /**
   * ==========================================
   * THÁNG/NĂM
   * VD:
   * 07/2026
   * ==========================================
   */
  private getThangNam(dto: ThongKeQueryDto): string | null {
    if (!dto.thang) {
      return null;
    }

    return `${String(dto.thang).padStart(2, "0")}/${dto.nam}`;
  }

  private getKyThongKe(dto: ThongKeQueryDto): string {
    if (!dto.thang) {
      return String(dto.nam);
    }

    return `${dto.nam}-${String(dto.thang).padStart(2, "0")}`;
  }

  private toJson(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  private isCurrentSnapshot(value: unknown): boolean {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return false;
    }

    const snapshot = value as Record<string, unknown>;

    return [
      snapshot.topPhong,
      snapshot.topCongNo,
      snapshot.topHangHoa,
      snapshot.topThietBiSua,
    ].every(Array.isArray);
  }

  /**
   * ==========================================
   * KHOẢNG NGÀY
   * ==========================================
   */
  private getDateRange(dto: ThongKeQueryDto) {
    const from = new Date(dto.nam, dto.thang ? dto.thang - 1 : 0, 1);

    const to = dto.thang
      ? new Date(dto.nam, dto.thang, 0, 23, 59, 59, 999)
      : new Date(dto.nam, 11, 31, 23, 59, 59, 999);

    return {
      from,
      to,
    };
  }

  /**
   * ==========================================
   * TỔNG QUAN
   * ==========================================
   */

  /**
   * ==========================================
   * TỔNG DOANH THU
   * ==========================================
   */
  private async getTongDoanhThu(dto: ThongKeQueryDto) {
    const thangNam = this.getThangNam(dto);

    const { from, to } = this.getDateRange(dto);

    const [hoaDonPhong, hoaDonGuiXe, hoaDonTapHoa] = await Promise.all([
      this.prisma.hoaDonPhong.aggregate({
        _sum: {
          soTien: true,
        },
        where: {
          isDelete: false,
          ...(thangNam
            ? {
                thangNam,
              }
            : {
                thangNam: {
                  endsWith: `${dto.nam}`,
                },
              }),
        },
      }),

      this.prisma.hoaDonGuiXe.aggregate({
        _sum: {
          soTien: true,
        },
        where: {
          isDelete: false,
          ...(thangNam
            ? {
                thangNam,
              }
            : {
                thangNam: {
                  endsWith: `${dto.nam}`,
                },
              }),
        },
      }),

      this.prisma.hoaDonTapHoa.aggregate({
        _sum: {
          tongTien: true,
        },
        where: {
          isDelete: false,
          ngayBan: {
            gte: from,
            lte: to,
          },
        },
      }),
    ]);

    const doanhThuPhong = this.toNumber(hoaDonPhong._sum.soTien);

    const doanhThuGuiXe = this.toNumber(hoaDonGuiXe._sum.soTien);

    const doanhThuTapHoa = this.toNumber(hoaDonTapHoa._sum.tongTien);

    return {
      doanhThuPhong,
      doanhThuGuiXe,
      doanhThuTapHoa,
      tongDoanhThu: doanhThuPhong + doanhThuGuiXe + doanhThuTapHoa,
    };
  }

  /**
   * ==========================================
   * TỔNG ĐÃ THU
   * ==========================================
   */
  private async getTongDaThu(dto: ThongKeQueryDto) {
    const { from, to } = this.getDateRange(dto);

    const [thuPhong, thuTapHoa] = await Promise.all([
      this.prisma.phieuThuHangThang.aggregate({
        _sum: {
          soTien: true,
        },
        where: {
          isDelete: false,
          ngayThu: {
            gte: from,
            lte: to,
          },
        },
      }),

      this.prisma.phieuThuHdTh.aggregate({
        _sum: {
          soTien: true,
        },
        where: {
          isDelete: false,
          ngayThu: {
            gte: from,
            lte: to,
          },
        },
      }),
    ]);

    const daThuPhong = this.toNumber(thuPhong._sum.soTien);

    const daThuTapHoa = this.toNumber(thuTapHoa._sum.soTien);

    return {
      daThuPhong,
      daThuTapHoa,
      tongDaThu: daThuPhong + daThuTapHoa,
    };
  }

  /**
   * ==========================================
   * TỔNG CÔNG NỢ
   * ==========================================
   */
  private async getTongCongNo(dto: ThongKeQueryDto) {
    const [doanhThu, daThu] = await Promise.all([
      this.getTongDoanhThu(dto),

      this.getTongDaThu(dto),
    ]);

    return {
      tongCongNo: doanhThu.tongDoanhThu - daThu.tongDaThu,
    };
  }

  /**
   * ==========================================
   * TỔNG CHI PHÍ
   * ==========================================
   */
  private async getTongChiPhi(dto: ThongKeQueryDto) {
    const { from, to } = this.getDateRange(dto);

    const hoaDonSuaChua = await this.prisma.hoaDonSuaChua.aggregate({
      _sum: {
        giaTien: true,
      },

      where: {
        isDelete: false,
        ngayLapHoaDonSc: {
          gte: from,
          lte: to,
        },
      },
    });

    return {
      tongChiPhi: this.toNumber(hoaDonSuaChua._sum.giaTien),
    };
  }

  /**
   * ==========================================
   * THỐNG KÊ
   * ==========================================
   */

  /**
   * ==========================================
   * THỐNG KÊ PHÒNG
   * ==========================================
   */
  private async getThongKePhong() {
    const [tongPhong, hopDongConHan] = await Promise.all([
      this.prisma.phong.count({
        where: {
          isDelete: false,
        },
      }),

      this.prisma.hopDong.findMany({
        where: {
          isDelete: false,
          trangThai: 1,
          ngayHetHan: {
            gte: new Date(),
          },
        },
        select: {
          phongId: true,
        },
        distinct: ["phongId"],
      }),
    ]);

    const phongDangThue = hopDongConHan.length;

    const phongTrong = tongPhong - phongDangThue;

    const tiLeLapDay =
      tongPhong === 0
        ? 0
        : Number(((phongDangThue / tongPhong) * 100).toFixed(2));

    return {
      tongPhong,
      phongDangThue,
      phongTrong,
      tiLeLapDay,
    };
  }

  /**
   * ==========================================
   * THỐNG KÊ NGƯỜI THUÊ
   * ==========================================
   */
  private async getThongKeNguoiThue() {
    const [tongNguoiThue, nguoiDangThue, nguoiDaDonDi, hopDongSapHet] =
      await Promise.all([
        this.prisma.nguoiThue.count({
          where: {
            isDelete: false,
          },
        }),

        this.prisma.nguoiThue.count({
          where: {
            isDelete: false,
            trangThai: 1,
          },
        }),

        this.prisma.nguoiThue.count({
          where: {
            isDelete: false,
            trangThai: 2,
          },
        }),

        this.prisma.hopDong.count({
          where: {
            isDelete: false,
            trangThai: 1,
            ngayHetHan: {
              gte: new Date(),
              lte: new Date(new Date().setDate(new Date().getDate() + 30)),
            },
          },
        }),
      ]);

    return {
      tongNguoiThue,
      nguoiDangThue,
      nguoiDaDonDi,
      hopDongSapHet,
    };
  }

  /**
   * ==========================================
   * THỐNG KÊ THIẾT BỊ
   * ==========================================
   */
  private async getThongKeThietBi() {
    const [
      tongThietBi,
      thietBiHoatDong,
      thietBiDangSua,
      thietBiHong,
      tongLapRap,
      tongSuaChua,
    ] = await Promise.all([
      this.prisma.thietBi.count({
        where: {
          isDelete: false,
        },
      }),

      this.prisma.thietBi.count({
        where: {
          isDelete: false,
          trangThai: 0,
        },
      }),

      this.prisma.thietBi.count({
        where: {
          isDelete: false,
          trangThai: 1,
        },
      }),

      this.prisma.thietBi.count({
        where: {
          isDelete: false,
          trangThai: 2,
        },
      }),

      this.prisma.lapRap.count({
        where: {
          isDelete: false,
        },
      }),

      this.prisma.suaChua.count({
        where: {
          isDelete: false,
        },
      }),
    ]);

    return {
      tongThietBi,
      thietBiHoatDong,
      thietBiDangSua,
      thietBiHong,
      tongLapRap,
      tongSuaChua,
    };
  }

  /**
   * ==========================================
   * BIỂU ĐỒ
   * ==========================================
   */

  /**
   * ==========================================
   * CHART DOANH THU 12 THÁNG
   * ==========================================
   */
  private async getChartDoanhThu(nam: number) {
    const chart = [];

    for (let thang = 1; thang <= 12; thang++) {
      const thangNam = `${String(thang).padStart(2, "0")}/${nam}`;

      const from = new Date(nam, thang - 1, 1);

      const to = new Date(nam, thang, 0, 23, 59, 59, 999);

      const [hoaDonPhong, hoaDonGuiXe, hoaDonTapHoa] = await Promise.all([
        this.prisma.hoaDonPhong.aggregate({
          _sum: {
            soTien: true,
          },
          where: {
            isDelete: false,
            thangNam,
          },
        }),

        this.prisma.hoaDonGuiXe.aggregate({
          _sum: {
            soTien: true,
          },
          where: {
            isDelete: false,
            thangNam,
          },
        }),

        this.prisma.hoaDonTapHoa.aggregate({
          _sum: {
            tongTien: true,
          },
          where: {
            isDelete: false,
            ngayBan: {
              gte: from,
              lte: to,
            },
          },
        }),
      ]);

      const doanhThu =
        this.toNumber(hoaDonPhong._sum.soTien) +
        this.toNumber(hoaDonGuiXe._sum.soTien) +
        this.toNumber(hoaDonTapHoa._sum.tongTien);

      chart.push({
        thang,
        doanhThu,
      });
    }

    return chart;
  }

  /**
   * ==========================================
   * TOP
   * ==========================================
   */

  private async getTopPhong(dto: ThongKeQueryDto) {
    const thangNam = this.getThangNam(dto);
    const { from, to } = this.getDateRange(dto);

    const invoices = await this.prisma.hoaDonPhong.findMany({
      where: {
        isDelete: false,
        ...(thangNam
          ? { thangNam }
          : { thangNam: { endsWith: `${dto.nam}` } }),
      },
      select: {
        soTien: true,
        phieuThuHangThang: {
          where: {
            isDelete: false,
            ngayThu: { gte: from, lte: to },
          },
          select: { soTien: true },
        },
        hopdong: {
          select: {
            phongId: true,
            phong: {
              select: {
                phongId: true,
                tenPhong: true,
              },
            },
          },
        },
      },
    });

    const rooms = new Map<
      number,
      {
        phongId: number;
        tenPhong: string | null;
        tongDoanhThu: number;
        tongDaThu: number;
        tongCongNo: number;
      }
    >();

    for (const invoice of invoices) {
      const room = invoice.hopdong?.phong;
      if (!room) continue;

      const revenue = this.toNumber(invoice.soTien);
      const collected = invoice.phieuThuHangThang.reduce(
        (sum, receipt) => sum + this.toNumber(receipt.soTien),
        0,
      );
      const current = rooms.get(room.phongId) ?? {
        phongId: room.phongId,
        tenPhong: room.tenPhong,
        tongDoanhThu: 0,
        tongDaThu: 0,
        tongCongNo: 0,
      };

      current.tongDoanhThu += revenue;
      current.tongDaThu += collected;
      rooms.set(room.phongId, current);
    }

    return [...rooms.values()]
      .map((room) => ({
        ...room,
        tongCongNo: Math.max(room.tongDoanhThu - room.tongDaThu, 0),
      }))
      .sort((a, b) => b.tongDoanhThu - a.tongDoanhThu)
      .slice(0, 5);
  }

  private async getTopCongNo(dto: ThongKeQueryDto) {
    const thangNam = this.getThangNam(dto);
    const { from, to } = this.getDateRange(dto);

    const [roomInvoices, groceryInvoices] = await Promise.all([
      this.prisma.hoaDonPhong.findMany({
        where: {
          isDelete: false,
          ...(thangNam
            ? { thangNam }
            : { thangNam: { endsWith: `${dto.nam}` } }),
        },
        select: {
          soTien: true,
          phieuThuHangThang: {
            where: {
              isDelete: false,
              ngayThu: { gte: from, lte: to },
            },
            select: { soTien: true },
          },
          hopdong: {
            select: {
              idnt: true,
              nguoithue: {
                select: {
                  idnt: true,
                  hoTen: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.hoaDonTapHoa.findMany({
        where: {
          isDelete: false,
          ngayBan: { gte: from, lte: to },
        },
        select: {
          tongTien: true,
          nguoiThue: {
            select: {
              idnt: true,
              hoTen: true,
            },
          },
          phieuThuHdTh: {
            where: {
              isDelete: false,
              ngayThu: { gte: from, lte: to },
            },
            select: { soTien: true },
          },
        },
      }),
    ]);

    const tenants = new Map<
      number,
      {
        idnt: number;
        hoTen: string | null;
        tongTien: number;
        tongDaThu: number;
        tongCongNo: number;
      }
    >();

    const addDebt = (
      tenant: { idnt: number; hoTen: string | null } | null | undefined,
      amount: number,
      collected: number,
    ) => {
      if (!tenant) return;

      const current = tenants.get(tenant.idnt) ?? {
        idnt: tenant.idnt,
        hoTen: tenant.hoTen,
        tongTien: 0,
        tongDaThu: 0,
        tongCongNo: 0,
      };

      current.tongTien += amount;
      current.tongDaThu += collected;
      tenants.set(tenant.idnt, current);
    };

    for (const invoice of roomInvoices) {
      addDebt(
        invoice.hopdong?.nguoithue,
        this.toNumber(invoice.soTien),
        invoice.phieuThuHangThang.reduce(
          (sum, receipt) => sum + this.toNumber(receipt.soTien),
          0,
        ),
      );
    }

    for (const invoice of groceryInvoices) {
      addDebt(
        invoice.nguoiThue,
        this.toNumber(invoice.tongTien),
        invoice.phieuThuHdTh.reduce(
          (sum, receipt) => sum + this.toNumber(receipt.soTien),
          0,
        ),
      );
    }

    return [...tenants.values()]
      .map((tenant) => ({
        ...tenant,
        tongCongNo: Math.max(tenant.tongTien - tenant.tongDaThu, 0),
      }))
      .filter((tenant) => tenant.tongCongNo > 0)
      .sort((a, b) => b.tongCongNo - a.tongCongNo)
      .slice(0, 5);
  }

  private async getTopHangHoa(dto: ThongKeQueryDto) {
    const { from, to } = this.getDateRange(dto);

    const invoices = await this.prisma.hoaDonTapHoa.findMany({
      where: {
        isDelete: false,
        ngayBan: { gte: from, lte: to },
      },
      select: {
        chiTietTapHoa: {
          where: { isDelete: false },
          select: {
            soLuong: true,
            hangHoa: {
              select: {
                maHangHoa: true,
                tenHangHoa: true,
                donViTinh: true,
                isDelete: true,
              },
            },
          },
        },
      },
    });

    const products = new Map<
      number,
      {
        maHangHoa: number;
        tenHangHoa: string | null;
        donViTinh: string | null;
        tongSoLuong: number;
      }
    >();

    for (const invoice of invoices) {
      for (const detail of invoice.chiTietTapHoa) {
        const product = detail.hangHoa;
        if (!product || product.isDelete) continue;

        const quantity = detail.soLuong ?? 0;
        const current = products.get(product.maHangHoa) ?? {
          maHangHoa: product.maHangHoa,
          tenHangHoa: product.tenHangHoa,
          donViTinh: product.donViTinh,
          tongSoLuong: 0,
        };

        current.tongSoLuong += quantity;
        products.set(product.maHangHoa, current);
      }
    }

    return [...products.values()]
      .sort((a, b) => b.tongSoLuong - a.tongSoLuong)
      .slice(0, 5);
  }

  private async getTopThietBiSua(dto: ThongKeQueryDto) {
    const { from, to } = this.getDateRange(dto);

    const repairs = await this.prisma.suaChua.findMany({
      where: {
        isDelete: false,
        ngaySuaChua: { gte: from, lte: to },
      },
      select: {
        thietbi: {
          select: {
            thietBiId: true,
            tenThietBi: true,
            loai: true,
            isDelete: true,
          },
        },
      },
    });

    const devices = new Map<
      number,
      {
        thietBiId: number;
        tenThietBi: string | null;
        loai: string | null;
        soLanSua: number;
      }
    >();

    for (const repair of repairs) {
      const device = repair.thietbi;
      if (!device || device.isDelete) continue;

      const current = devices.get(device.thietBiId) ?? {
        thietBiId: device.thietBiId,
        tenThietBi: device.tenThietBi,
        loai: device.loai,
        soLanSua: 0,
      };

      current.soLanSua += 1;
      devices.set(device.thietBiId, current);
    }

    return [...devices.values()]
      .sort((a, b) => b.soLanSua - a.soLanSua)
      .slice(0, 5);
  }

  /**
   * ==========================================
   * HỢP ĐỒNG
   * ==========================================
   */

  /**
   * ==========================================
   * HỢP ĐỒNG SẮP HẾT HẠN
   * (Trong 30 ngày tới)
   * ==========================================
   */
  private async getHopDongSapHet() {
    const today = new Date();

    const after30Days = new Date();

    after30Days.setDate(after30Days.getDate() + 30);

    const hopDongSapHet = await this.prisma.hopDong.findMany({
      where: {
        isDelete: false,
        trangThai: 1,
        ngayHetHan: {
          gte: today,
          lte: after30Days,
        },
      },

      include: {
        phong: {
          select: {
            phongId: true,
            tenPhong: true,
          },
        },

        nguoithue: {
          select: {
            idnt: true,
            hoTen: true,
            sdt: true,
          },
        },
      },

      orderBy: {
        ngayHetHan: "asc",
      },

      take: 5,
    });

    return hopDongSapHet;
  }

  /**
   * ==========================================
   * API
   * ==========================================
   */

  private async tinhThongKe(dto: ThongKeQueryDto) {
    const [
      doanhThu,
      daThu,
      congNo,
      chiPhi,
      phong,
      nguoiThue,
      thietBi,
      chart,
      topPhong,
      topCongNo,
      topHangHoa,
      topThietBiSua,
      hopDongSapHet,
    ] = await Promise.all([
      this.getTongDoanhThu(dto),

      this.getTongDaThu(dto),

      this.getTongCongNo(dto),

      this.getTongChiPhi(dto),

      this.getThongKePhong(),

      this.getThongKeNguoiThue(),

      this.getThongKeThietBi(),

      this.getChartDoanhThu(dto.nam),

      this.getTopPhong(dto),

      this.getTopCongNo(dto),

      this.getTopHangHoa(dto),

      this.getTopThietBiSua(dto),

      this.getHopDongSapHet(),
    ]);

    return {
      doanhThu,
      daThu,
      congNo,
      chiPhi,
      phong,
      nguoiThue,
      thietBi,
      chart,
      topPhong,
      topCongNo,
      topHangHoa,
      topThietBiSua,
      hopDongSapHet,
    };
  }

  async getThongKe(dto: ThongKeQueryDto) {
    const kyThongKe = this.getKyThongKe(dto);

    const now = new Date();

    const snapshot = await this.prisma.thongKeSnapshot.findUnique({
      where: {
        kyThongKe,
      },
    });

    if (
      snapshot &&
      snapshot.hetHanLuc > now &&
      this.isCurrentSnapshot(snapshot.duLieu)
    ) {
      return snapshot.duLieu;
    }

    const duLieu = await this.tinhThongKe(dto);

    const duLieuJson = this.toJson(duLieu);

    const hetHanLuc = new Date(now.getTime() + this.snapshotTtlMs);

    await this.prisma.thongKeSnapshot.upsert({
      where: {
        kyThongKe,
      },
      create: {
        kyThongKe,
        nam: dto.nam,
        thang: dto.thang ?? null,
        duLieu: duLieuJson,
        tinhTuLuc: now,
        hetHanLuc,
      },
      update: {
        nam: dto.nam,
        thang: dto.thang ?? null,
        duLieu: duLieuJson,
        tinhTuLuc: now,
        hetHanLuc,
      },
    });

    return duLieuJson;
  }
}
