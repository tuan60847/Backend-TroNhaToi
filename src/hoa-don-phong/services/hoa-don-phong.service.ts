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

  findAll() {
    return this.prisma.hoaDonPhong.findMany({
      where: { isDelete: false },
      //include: { hopDong: { include: { nguoiThue: true, phong: true } }, phieuThuHangThang: true },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.hoaDonPhong.findFirst({
      where: { maHoaDon: id, isDelete: false },
      //include: { hopDong: { include: { nguoiThue: true, phong: true } }, phieuThuHangThang: true },
    });
    if (!item) throw new NotFoundException(`HoaDonPhong với id ${id} không tồn tại`);
    return item;
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

    const [data, total] = await Promise.all([
      this.prisma.hoaDonPhong.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.hoaDonPhong.count({ where }),
    ]);

    return { total, data };
  }

  async statistics(req: StatisticsHoaDonPhongDto) {
    const { thangNam } = req;
    const where: any = { isDelete: false };
    if (thangNam) where.thangNam = thangNam;

    const [aggregate, byMonth] = await Promise.all([
      this.prisma.hoaDonPhong.aggregate({
        where,
        _sum: { soTien: true },
        _count: { maHoaDon: true },
      }),
      this.prisma.hoaDonPhong.groupBy({
        by: ['thangNam'],
        where,
        _sum: { soTien: true },
        _count: { maHoaDon: true },
      }),
    ]);

    return {
      totalInvoices: aggregate._count.maHoaDon,
      totalRevenue: Number(aggregate._sum.soTien ?? 0),
      byMonth: byMonth
        .map((b) => ({
          thangNam: b.thangNam,
          totalInvoices: b._count.maHoaDon,
          totalRevenue: Number(b._sum.soTien ?? 0),
        }))
        .sort((a, b) => (a.thangNam ?? '').localeCompare(b.thangNam ?? '')),
    };
  }

  getAllLoadingBalance(id?: string) {
    return this.prisma.hoaDonPhong.findMany({
      where: { isDelete: false },
      orderBy: { maHoaDon: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { maHoaDon: id } }
        : {}),
    });
  }

}
