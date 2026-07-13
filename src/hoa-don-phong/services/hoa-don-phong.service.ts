import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHoaDonPhongDto } from '../dto/create-hoa-don-phong.dto';
import { UpdateHoaDonPhongDto } from '../dto/update-hoa-don-phong.dto';
import { SearchHoaDonPhongDto } from '../dto/search-hoa-don-phong.dto';
import { StatisticsHoaDonPhongDto } from '../dto/statistics-hoa-don-phong.dto';
import { generateId } from '../../common/utils/generate-id.util';

@Injectable()
export class HoaDonPhongService {
  constructor(private prisma: PrismaService) {}

  private transform(raw: any) {
    const { hopDongId, isDelete, ...rest } = raw;
    return { ...rest, HopDongID: hopDongId };
  }

  async findAll() {
    const rows = await this.prisma.hoaDonPhong.findMany({ where: { isDelete: false } });
    return rows.map((r) => this.transform(r));
  }

  async findOne(id: string) {
    const item = await this.prisma.hoaDonPhong.findFirst({
      where: { maHoaDon: id, isDelete: false },
    });
    if (!item) throw new NotFoundException(`HoaDonPhong với id ${id} không tồn tại`);
    return this.transform(item);
  }

  create(dto: CreateHoaDonPhongDto) {
    return this.prisma.hoaDonPhong.create({
      data: { maHoaDon: generateId('HDP', 23), ...dto } as any,
    });
  }

  async update(id: string, dto: UpdateHoaDonPhongDto) {
    await this.findOne(id);
    return this.prisma.hoaDonPhong.update({ where: { maHoaDon: id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.hoaDonPhong.update({ where: { maHoaDon: id }, data: { isDelete: true } });
  }
  async search(req: SearchHoaDonPhongDto) {
    const { ma, limit = 10, offset = 0, sortBy = 'maHoaDon', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (ma) {
      where.maHoaDon = { contains: ma };
    }

    const [rows, total] = await Promise.all([
      this.prisma.hoaDonPhong.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.hoaDonPhong.count({ where }),
    ]);

    return { total, data: rows.map((r) => this.transform(r)) };
  }

  // Thống kê theo năm: mỗi tháng gồm tổng tiền hóa đơn và số tiền còn nợ
  // (soTien - đã thu qua các phiếu thu hàng tháng). `thangNam` lưu dạng chuỗi
  // "MM/YYYY" nên cần dựng sẵn danh sách 12 chuỗi tháng của năm để lọc/khớp.
  async statistics(req: StatisticsHoaDonPhongDto) {
    const year = req.year ?? new Date().getFullYear();
    const thangNamList = Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, '0')}/${year}`);

    const items = await this.prisma.hoaDonPhong.findMany({
      where: { isDelete: false, thangNam: { in: thangNamList } },
      select: {
        thangNam: true,
        soTien: true,
        phieuThuHangThang: { where: { isDelete: false }, select: { soTien: true } },
      },
    });

    const byMonth = thangNamList.map((thangNam) => ({
      thangNam,
      totalInvoices: 0,
      totalRevenue: 0,
      totalDebt: 0,
    }));

    let totalRevenue = 0;
    let totalDebt = 0;

    for (const item of items) {
      const monthIndex = thangNamList.indexOf(item.thangNam ?? '');
      if (monthIndex === -1) continue;

      const soTien = Number(item.soTien ?? 0);
      const daThu = item.phieuThuHangThang.reduce((sum, pt) => sum + Number(pt.soTien ?? 0), 0);
      const conNo = soTien - daThu;

      const cur = byMonth[monthIndex];
      cur.totalInvoices += 1;
      cur.totalRevenue += soTien;
      cur.totalDebt += conNo;

      totalRevenue += soTien;
      totalDebt += conNo;
    }

    return {
      year,
      totalInvoices: items.length,
      totalRevenue,
      totalDebt,
      byMonth,
    };
  }

  async getAllLoadingBalance(id?: string) {
    const rows = await this.prisma.hoaDonPhong.findMany({
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
