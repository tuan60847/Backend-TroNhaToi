import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSuaChuaDto } from '../dto/create-sua-chua.dto';
import { UpdateSuaChuaDto } from '../dto/update-sua-chua.dto';
import { SearchSuaChuaDto } from '../dto/search-sua-chua.dto';

@Injectable()
export class SuaChuaService {
  constructor(private prisma: PrismaService) {}

  /** Đổi tên key Prisma → key app Flutter đang đọc */
  private transform(raw: any) {
    const { hoadonsuachua, phongId, thietBiId, isDelete, ...rest } = raw;

    const suaChua = { ...rest, PhongID: phongId, thietBiId };

    let hoaDonSuaChua: Record<string, any> | null = null;
    if (hoadonsuachua) {
      const { maHoaDonSc, trangThai, ngayLapHoaDonSc, idSuaChua, isDelete: _d, ...hdRest } = hoadonsuachua;
      hoaDonSuaChua = {
        ...hdRest,
        maHoaDonSC: maHoaDonSc,
        TrangThai: trangThai,
        ngayLapHoaDonSC: ngayLapHoaDonSc,
        id: idSuaChua,
      };
    }

    return { suaChua, hoaDonSuaChua };
  }

  async findAll() {
    const rows = await this.prisma.suaChua.findMany({
      where: { isDelete: false },
      include: { hoadonsuachua: true },
    });
    return rows.map((r) => this.transform(r));
  }

  async findOne(id: number) {
    const item = await this.prisma.suaChua.findFirst({
      where: { id, isDelete: false },
      include: { hoadonsuachua: true },
    });
    if (!item) throw new NotFoundException(`SuaChua với id ${id} không tồn tại`);
    return this.transform(item);
  }

  create(dto: CreateSuaChuaDto) {
    return this.prisma.suaChua.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateSuaChuaDto) {
    await this.findOne(id);
    return this.prisma.suaChua.update({ where: { id: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.suaChua.update({ where: { id: id }, data: { isDelete: true } });
  }
  async search(req: SearchSuaChuaDto) {
    const { q, phongId, thietBiId, limit = 10, offset = 0, sortBy = 'id', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (q) {
      where.nguyenNhan = { contains: q };
    }

    if (phongId !== undefined) {
      where.phongId = phongId;
    }

    if (thietBiId !== undefined) {
      where.thietBiId = thietBiId;
    }

    const [rows, total] = await Promise.all([
      this.prisma.suaChua.findMany({
        where,
        include: { hoadonsuachua: true },
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.suaChua.count({ where }),
    ]);

    return { total, data: rows.map((r) => this.transform(r)) };
  }

  getAllLoadingBalance(id?: number) {
    return this.prisma.suaChua.findMany({
      where: { isDelete: false },
      orderBy: { id: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { id: id } }
        : {}),
    });
  }

}
