import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHoaDonGuiXeDto } from '../dto/create-hoa-don-gui-xe.dto';
import { UpdateHoaDonGuiXeDto } from '../dto/update-hoa-don-gui-xe.dto';
import { SearchHoaDonGuiXeDto } from '../dto/search-hoa-don-gui-xe.dto';
import { StatisticsHoaDonGuiXeDto } from '../dto/statistics-hoa-don-gui-xe.dto';

@Injectable()
export class HoaDonGuiXeService {
  constructor(private prisma: PrismaService) {}

  private transform(raw: any) {
    const { idPT, TrangThai, isDelete, ...rest } = raw;
    return { ...rest, idPhuongTien: idPT, trangThai: TrangThai };
  }

  async findAll() {
    const rows = await this.prisma.hoaDonGuiXe.findMany({ where: { isDelete: false } });
    return rows.map((r) => this.transform(r));
  }

  async findOne(id: number) {
    const item = await this.prisma.hoaDonGuiXe.findFirst({
      where: { maHoaDon: id, isDelete: false },
    });
    if (!item) throw new NotFoundException(`HoaDonGuiXe với id ${id} không tồn tại`);
    return this.transform(item);
  }

  create(dto: CreateHoaDonGuiXeDto) {
    return this.prisma.hoaDonGuiXe.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateHoaDonGuiXeDto) {
    await this.findOne(id);
    return this.prisma.hoaDonGuiXe.update({ where: { maHoaDon: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.hoaDonGuiXe.update({ where: { maHoaDon: id }, data: { isDelete: true } });
  }
  async search(req: SearchHoaDonGuiXeDto) {
    const { q, trangThai, idPT, limit = 10, offset = 0, sortBy = 'maHoaDon', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (q) {
      where.thangNam = { contains: q };
    }

    if (trangThai !== undefined) {
      where.TrangThai = trangThai;
    }

    if (idPT !== undefined) {
      where.idPT = idPT;
    }

    const [rows, total] = await Promise.all([
      this.prisma.hoaDonGuiXe.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.hoaDonGuiXe.count({ where }),
    ]);

    return { total, data: rows.map((r) => this.transform(r)) };
  }

  // Thống kê theo năm: 12 tháng (thangNam dạng chuỗi "MM/YYYY") + tổng hợp
  // theo TrangThai (không giả định ý nghĩa cụ thể của từng giá trị trạng thái,
  // vì hóa đơn gửi xe không có bảng phiếu thu riêng để tính "còn nợ" như tạp hóa).
  async statistics(req: StatisticsHoaDonGuiXeDto) {
    const year = req.year ?? new Date().getFullYear();
    const thangNamList = Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, '0')}/${year}`);

    const items = await this.prisma.hoaDonGuiXe.findMany({
      where: { isDelete: false, thangNam: { in: thangNamList } },
      select: { thangNam: true, soTien: true, TrangThai: true },
    });

    const byMonth = thangNamList.map((thangNam) => ({
      thangNam,
      totalInvoices: 0,
      totalRevenue: 0,
    }));

    const byTrangThaiMap = new Map<number, { totalInvoices: number; totalRevenue: number }>();
    let totalRevenue = 0;

    for (const item of items) {
      const soTien = Number(item.soTien ?? 0);
      const monthIndex = thangNamList.indexOf(item.thangNam ?? '');
      if (monthIndex !== -1) {
        const cur = byMonth[monthIndex];
        cur.totalInvoices += 1;
        cur.totalRevenue += soTien;
      }

      const trangThai = item.TrangThai ?? 0;
      const tCur = byTrangThaiMap.get(trangThai) ?? { totalInvoices: 0, totalRevenue: 0 };
      tCur.totalInvoices += 1;
      tCur.totalRevenue += soTien;
      byTrangThaiMap.set(trangThai, tCur);

      totalRevenue += soTien;
    }

    return {
      year,
      totalInvoices: items.length,
      totalRevenue,
      byMonth,
      byTrangThai: Array.from(byTrangThaiMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([trangThai, v]) => ({ trangThai, ...v })),
    };
  }

  async getAllLoadingBalance(id?: number) {
    const rows = await this.prisma.hoaDonGuiXe.findMany({
      where: { isDelete: false },
      orderBy: { maHoaDon: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { maHoaDon: id } }
        : {}),
    });
    return rows.map((r) => this.transform(r));
  }

}
