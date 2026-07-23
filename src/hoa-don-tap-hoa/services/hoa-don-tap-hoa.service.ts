import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHoaDonTapHoaDto } from '../dto/create-hoa-don-tap-hoa.dto';
import { UpdateHoaDonTapHoaDto } from '../dto/update-hoa-don-tap-hoa.dto';
import { SearchHoaDonTapHoaDto } from '../dto/search-hoa-don-tap-hoa.dto';
import { StatisticsHoaDonTapHoaDto } from '../dto/statistics-hoa-don-tap-hoa.dto';

@Injectable()
export class HoaDonTapHoaService {
  constructor(private prisma: PrismaService) { }



  private readonly includeAll = {
    nguoiThue: true,
    chiTietTapHoa: { where: { isDelete: false }, include: { hangHoa: true } },
    phieuThuHdTh: { where: { isDelete: false } },
  } as const;


  // App Flutter hiện chỉ hiển thị 1 phiếu thu/hóa đơn (field `phieuThu`, object đơn):
  // lấy phiếu thu mới nhất để giữ tương thích ngược, đồng thời trả thêm
  // `dsPhieuThu`/`daThu` cho các client cần đầy đủ danh sách nhiều phiếu thu.
  private latestPhieuThu(list: any[]) {
    if (!list?.length) return null;
    return [...list].sort((a, b) => (b.maPhieuThu ?? 0) - (a.maPhieuThu ?? 0))[0];
  }

  /** Chuyển raw Prisma record sang shape mà app Flutter mong đợi */
  private transform(raw: any) {
    const { nguoiThue, chiTietTapHoa = [], phieuThuHdTh = [], ...rest } = raw;

    const dsHangHoa = chiTietTapHoa
      .filter((ct: any) => ct.hangHoa != null)
      .map((ct: any) => ct.hangHoa);

    // soLuong: { [maHangHoa]: soLuong } — app dùng để hiển thị số lượng từng mặt hàng
    const soLuong: Record<number, number> = {};
    for (const ct of chiTietTapHoa) {
      if (ct.maHangHoa != null && ct.soLuong != null) {
        soLuong[ct.maHangHoa] = ct.soLuong;
      }
    }

    // 1 hóa đơn tạp hóa có thể có nhiều phiếu thu (thu nhiều lần)
    const daThu = phieuThuHdTh.reduce((sum: number, pt: any) => sum + Number(pt.soTien ?? 0), 0);
    const tongTien = Number(rest.tongTien ?? 0);

    return {
      ...rest,
      tenNguoiMua: nguoiThue?.hoTen ?? null,
      phieuThu: this.latestPhieuThu(phieuThuHdTh),
      dsPhieuThu: phieuThuHdTh,
      daThu,
      conNo: Math.max(tongTien - daThu, 0),
      dsHangHoa,
      soLuong,
    };
  }

  async findAll() {
    const rows = await this.prisma.hoaDonTapHoa.findMany({
      where: { isDelete: false },
      include: this.includeAll,
    });
    return rows.map((r) => this.transform(r));
  }

  async findOne(id: string) {
    const item = await this.prisma.hoaDonTapHoa.findFirst({
      where: { maHoaDon: id, isDelete: false },
      include: this.includeAll,
    });
    if (!item) throw new NotFoundException(`HoaDonTapHoa với id ${id} không tồn tại`);
    return this.transform(item);
  }

  private async generateMaHoaDon(): Promise<string> {
    const now = new Date();
    const dateStr =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');
    const prefix = `TH${dateStr}`;

    const last = await this.prisma.hoaDonTapHoa.findFirst({
      where: { maHoaDon: { startsWith: prefix } },
      orderBy: { maHoaDon: 'desc' },
      select: { maHoaDon: true },
    });

    const nextStt = last ? parseInt(last.maHoaDon.slice(-3), 10) + 1 : 1;
    return `${prefix}${String(nextStt).padStart(3, '0')}`;
  }

  async create(dto: CreateHoaDonTapHoaDto) {
    const maHoaDon = await this.generateMaHoaDon();
    const { chiTietTapHoa, phieuThuHdTh, ...hoaDonData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const hoaDon = await tx.hoaDonTapHoa.create({
        data: { maHoaDon, ...hoaDonData } as any,
      });

      if (chiTietTapHoa?.length) {
        await tx.chiTietTapHoa.createMany({
          data: chiTietTapHoa.map((ct) => ({
            maHoaDon,
            maHangHoa: ct.maHangHoa,
            soLuong: ct.soLuong,
          })),
        });
      }

      if (phieuThuHdTh?.length) {
        await tx.phieuThuHdTh.createMany({
          data: phieuThuHdTh.map((pt) => ({
            maHoaDon,
            ngayThu: pt.ngayThu,
            soTien: pt.soTien,
            nguoiDong: pt.nguoiDong,
          })),
        });
      }

      const result = await tx.hoaDonTapHoa.findFirst({
        where: { maHoaDon },
        include: this.includeAll,
      });
      return this.transform(result);
    });
  }

  // FE gửi lại toàn bộ `chiTietTapHoa` mỗi khi sửa hóa đơn (thêm/bớt/đổi số lượng
  // hàng hóa) — cần thay thế toàn bộ chi tiết cũ bằng danh sách mới, nếu không
  // tongTien sẽ bị lệch so với chi tiết hàng hóa thực tế lưu trong DB.
  //
  // FE cũng gửi `phieuThuHdTh` (1 object) mỗi khi đánh dấu hóa đơn đã thu tiền.
  // Vì 1 hóa đơn có thể có nhiều phiếu thu, mỗi lần sửa kèm phieuThuHdTh sẽ
  // ghi thêm 1 phiếu thu mới (không upsert/ghi đè phiếu thu cũ).
  async update(id: string, dto: UpdateHoaDonTapHoaDto) {
    await this.findOne(id);

    const { chiTietTapHoa, phieuThuHdTh, ...hoaDonData } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Chỉ thêm các phiếu thu chưa tồn tại
      if (phieuThuHdTh?.length) {
        const dataCanThem = [];

        for (const pt of phieuThuHdTh) {
          // Nếu FE gửi mã phiếu thu thì kiểm tra đã tồn tại chưa
          if (pt.maPhieuThu) {
            const existed = await tx.phieuThuHdTh.findUnique({
              where: {
                maPhieuThu: pt.maPhieuThu,
              },
            });

            if (existed) {
              continue;
            }
          }

          dataCanThem.push({
            maHoaDon: id,
            ngayThu: pt.ngayThu,
            soTien: pt.soTien,
            nguoiDong: pt.nguoiDong,
          });
        }

        if (dataCanThem.length > 0) {
          await tx.phieuThuHdTh.createMany({
            data: dataCanThem,
          });
        }
      }

      const result = await tx.hoaDonTapHoa.update({
        where: {
          maHoaDon: id,
        },
        data: {
          idnt: hoaDonData.idnt,
          ngayBan: hoaDonData.ngayBan,
          tongTien: hoaDonData.tongTien,
        },
        include: this.includeAll,
      });

      return this.transform(result);
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.hoaDonTapHoa.update({ where: { maHoaDon: id }, data: { isDelete: true } });
  }
  async search(req: SearchHoaDonTapHoaDto) {
    const { ma, limit = 10, offset = 0, sortBy = 'maHoaDon', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (ma) {
      where.maHoaDon = { contains: ma };
    }

    const [data, total] = await Promise.all([
      this.prisma.hoaDonTapHoa.findMany({
        where,
        include: this.includeAll,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.hoaDonTapHoa.count({ where }),
    ]);

    return {
      total,
      data: data.map((item) => this.transform(item)),
    };
  }

  async statistics(req: StatisticsHoaDonTapHoaDto) {
    const year = req.year ?? new Date().getFullYear();
    const from = new Date(Date.UTC(year, 0, 1));
    const to = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

    const items = await this.prisma.hoaDonTapHoa.findMany({
      where: {
        isDelete: false,
        ngayBan: { gte: from, lte: to },
      },
      select: {
        ngayBan: true,
        tongTien: true,
        phieuThuHdTh: {
          where: {
            isDelete: false,
            ngayThu: { gte: from, lte: to },
          },
          select: { soTien: true },
        },
      },
    });

    const byMonth = Array.from({ length: 12 }, (_, index) => ({
      month: `${year}-${String(index + 1).padStart(2, '0')}`,
      totalInvoices: 0,
      totalRevenue: 0,
      totalCollected: 0,
      totalDebt: 0,
    }));

    let totalRevenue = 0;
    let totalCollected = 0;

    for (const item of items) {
      if (!item.ngayBan) continue;

      const revenue = Number(item.tongTien ?? 0);
      const collected = item.phieuThuHdTh.reduce(
        (sum, receipt) => sum + Number(receipt.soTien ?? 0),
        0,
      );
      const month = byMonth[item.ngayBan.getUTCMonth()];

      month.totalInvoices += 1;
      month.totalRevenue += revenue;
      month.totalCollected += collected;

      totalRevenue += revenue;
      totalCollected += collected;
    }

    for (const month of byMonth) {
      month.totalDebt = Math.max(
        month.totalRevenue - month.totalCollected,
        0,
      );
    }

    const totalDebt = Math.max(totalRevenue - totalCollected, 0);

    return {
      year,
      totalInvoices: items.length,
      totalRevenue,
      totalCollected,
      totalDebt,
      byMonth,
    };
  }

  getAllLoadingBalance(id?: string) {
    return this.prisma.hoaDonTapHoa.findMany({
      where: { isDelete: false },
      orderBy: { maHoaDon: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { maHoaDon: id } }
        : {}),
    });
  }

  // Get Danh sách Hàng Hoá Model
  async findDSHangHoaModel() {
    const data = await this.prisma.hoaDonTapHoa.findMany({
      where: {
        isDelete: false,
      },
      include: {
        nguoiThue: {
          select: {
            hoTen: true,
          },
        },
        phieuThuHdTh: { where: { isDelete: false } },
      },
    });

    return data.map(({ nguoiThue, phieuThuHdTh, ...hoaDon }) => ({
      hoaDon,

      // app Flutter đọc field `phieuThu` (object đơn, phiếu thu mới nhất)
      // phieuThu: this.latestPhieuThu(phieuThuHdTh),
      // dsPhieuThu: phieuThuHdTh,
      daThu: phieuThuHdTh.reduce((sum: number, pt: any) => sum + Number(pt.soTien ?? 0), 0),
      tongtien: Number(hoaDon.tongTien ?? 0),
      tenNguoiMua: nguoiThue?.hoTen ?? null,
    }));
  }


}
