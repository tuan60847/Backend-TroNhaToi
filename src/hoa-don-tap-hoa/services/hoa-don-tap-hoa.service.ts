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


  private readonly selectAll = {
    nguoiThue: true,
    phieuThuHdTh: { where: { isDelete: false } },
  } as const;

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

    return {
      ...rest,
      tenNguoiMua: nguoiThue?.hoTen ?? null,
      dsPhieuThu: phieuThuHdTh,
      daThu,
      dsHangHoa,
      soLuong,
    };
  }

  async findAll() {
    const rows = await this.prisma.hoaDonTapHoa.findMany({
      where: { isDelete: false },
      include: this.selectAll,
    });
    return rows.map((r) => this.transform(r));
  }

  async findOne(id: string) {
    const item = await this.prisma.hoaDonTapHoa.findFirst({
      where: { maHoaDon: id, isDelete: false },
      include: this.selectAll,
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
          data: phieuThuHdTh.map((pt) => ({ maHoaDon, ...pt })),
        });
      }

      const result = await tx.hoaDonTapHoa.findFirst({
        where: { maHoaDon },
        include: this.includeAll,
      });
      return this.transform(result);
    });
  }

  // Không xử lý phieuThuHdTh ở đây nữa: 1 hóa đơn có thể có nhiều phiếu thu,
  // việc thêm/sửa/xóa từng phiếu thu được thực hiện qua endpoint /phieu-thu-hdth.
  async update(id: string, dto: UpdateHoaDonTapHoaDto) {
    await this.findOne(id);

    return this.prisma.hoaDonTapHoa.update({
      where: { maHoaDon: id },
      data: {
        idnt: dto.idnt,
        ngayBan: dto.ngayBan,
        tongTien: dto.tongTien,
      },
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
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.hoaDonTapHoa.count({ where }),
    ]);

    return { total, data };
  }

  async statistics(req: StatisticsHoaDonTapHoaDto) {
    const { from, to } = req;
    const where: any = { isDelete: false };

    if (from || to) {
      where.ngayBan = {};
      if (from) where.ngayBan.gte = new Date(from);
      if (to) where.ngayBan.lte = new Date(to);
    }

    const [aggregate, items] = await Promise.all([
      this.prisma.hoaDonTapHoa.aggregate({
        where,
        _sum: { tongTien: true },
        _count: { maHoaDon: true },
      }),
      this.prisma.hoaDonTapHoa.findMany({
        where,
        select: { ngayBan: true, tongTien: true },
      }),
    ]);

    const byMonthMap = new Map<string, { totalInvoices: number; totalRevenue: number }>();
    for (const item of items) {
      if (!item.ngayBan) continue;
      const month = item.ngayBan.toISOString().slice(0, 7);
      const cur = byMonthMap.get(month) ?? { totalInvoices: 0, totalRevenue: 0 };
      cur.totalInvoices += 1;
      cur.totalRevenue += Number(item.tongTien ?? 0);
      byMonthMap.set(month, cur);
    }

    return {
      totalInvoices: aggregate._count.maHoaDon,
      totalRevenue: Number(aggregate._sum.tongTien ?? 0),
      byMonth: Array.from(byMonthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, v]) => ({ month, ...v })),
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

      dsPhieuThu: phieuThuHdTh,

      tenNguoiMua: nguoiThue?.hoTen ?? null,
    }));
  }


}
