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

  async statistics(req: StatisticsHoaDonGuiXeDto) {
    const { thangNam } = req;
    const where: any = { isDelete: false };
    if (thangNam) where.thangNam = thangNam;

    const [aggregate, byMonth] = await Promise.all([
      this.prisma.hoaDonGuiXe.aggregate({
        where,
        _sum: { soTien: true },
        _count: { maHoaDon: true },
      }),
      this.prisma.hoaDonGuiXe.groupBy({
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
