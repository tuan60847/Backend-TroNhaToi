import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhieuThuHangThangDto } from '../dto/create-phieu-thu-hang-thang.dto';
import { UpdatePhieuThuHangThangDto } from '../dto/update-phieu-thu-hang-thang.dto';
import { SearchPhieuThuHangThangDto } from '../dto/search-phieu-thu-hang-thang.dto';
import { StatisticsPhieuThuHangThangDto } from '../dto/statistics-phieu-thu-hang-thang.dto';

@Injectable()
export class PhieuThuHangThangService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.phieuThuHangThang.findMany({
      where: { isDelete: false },
     // include: { hoaDonPhong: { include: { hopDong: { include: { nguoiThue: true, phong: true } } } } },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.phieuThuHangThang.findFirst({
      where: { maPhieuThu: id, isDelete: false },
      // include: { hoaDonPhong: { include: { hopDong: { include: { nguoiThue: true, phong: true } } } } },
    });
    if (!item) throw new NotFoundException(`PhieuThuHangThang với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreatePhieuThuHangThangDto) {
    return this.prisma.phieuThuHangThang.create({ data: dto as any });
  }

  async update(id: number, dto: UpdatePhieuThuHangThangDto) {
    await this.findOne(id);
    return this.prisma.phieuThuHangThang.update({ where: { maPhieuThu: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.phieuThuHangThang.update({ where: { maPhieuThu: id }, data: { isDelete: true } });
  }
  async search(req: SearchPhieuThuHangThangDto) {
    const { ma, limit = 10, offset = 0, sortBy = 'maPhieuThu', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (ma) {
      where.maHoaDon = { contains: ma };
    }

    const [data, total] = await Promise.all([
      this.prisma.phieuThuHangThang.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.phieuThuHangThang.count({ where }),
    ]);

    return { total, data };
  }

  async statistics(req: StatisticsPhieuThuHangThangDto) {
    const { from, to } = req;
    const where: any = { isDelete: false };

    if (from || to) {
      where.ngayThu = {};
      if (from) where.ngayThu.gte = new Date(from);
      if (to) where.ngayThu.lte = new Date(to);
    }

    const [aggregate, items] = await Promise.all([
      this.prisma.phieuThuHangThang.aggregate({
        where,
        _sum: { soTien: true },
        _count: { maPhieuThu: true },
      }),
      this.prisma.phieuThuHangThang.findMany({
        where,
        select: { ngayThu: true, soTien: true },
      }),
    ]);

    const byMonthMap = new Map<string, { totalReceipts: number; totalCollected: number }>();
    for (const item of items) {
      if (!item.ngayThu) continue;
      const month = item.ngayThu.toISOString().slice(0, 7);
      const cur = byMonthMap.get(month) ?? { totalReceipts: 0, totalCollected: 0 };
      cur.totalReceipts += 1;
      cur.totalCollected += Number(item.soTien ?? 0);
      byMonthMap.set(month, cur);
    }

    return {
      totalReceipts: aggregate._count.maPhieuThu,
      totalCollected: Number(aggregate._sum.soTien ?? 0),
      byMonth: Array.from(byMonthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, v]) => ({ month, ...v })),
    };
  }

  getAllLoadingBalance(id?: number) {
    return this.prisma.phieuThuHangThang.findMany({
      where: { isDelete: false },
      orderBy: { maPhieuThu: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { maPhieuThu: id } }
        : {}),
    });
  }

}
