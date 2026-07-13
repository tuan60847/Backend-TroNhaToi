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

  // Thống kê theo năm: đủ 12 tháng, tháng không có phiếu thu vẫn hiện 0.
  async statistics(req: StatisticsPhieuThuHangThangDto) {
    const year = req.year ?? new Date().getFullYear();
    const from = new Date(Date.UTC(year, 0, 1));
    const to = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

    const items = await this.prisma.phieuThuHangThang.findMany({
      where: { isDelete: false, ngayThu: { gte: from, lte: to } },
      select: { ngayThu: true, soTien: true },
    });

    const byMonth = Array.from({ length: 12 }, (_, i) => ({
      month: `${year}-${String(i + 1).padStart(2, '0')}`,
      totalReceipts: 0,
      totalCollected: 0,
    }));

    let totalCollected = 0;
    for (const item of items) {
      if (!item.ngayThu) continue;
      const monthIndex = item.ngayThu.getUTCMonth();
      const soTien = Number(item.soTien ?? 0);
      byMonth[monthIndex].totalReceipts += 1;
      byMonth[monthIndex].totalCollected += soTien;
      totalCollected += soTien;
    }

    return {
      year,
      totalReceipts: items.length,
      totalCollected,
      byMonth,
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
