import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSuaChuaDto } from '../dto/create-sua-chua.dto';
import { UpdateSuaChuaDto } from '../dto/update-sua-chua.dto';
import { SearchSuaChuaDto } from '../dto/search-sua-chua.dto';
import { ThongKeThietBiSuaChuaDto } from '../dto/thong-ke-thiet-bi-sua-chua.dto';

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

  // Thống kê thiết bị có nhiều lịch sử sửa chữa nhất trong 1 tháng: đếm số lần
  // sửa chữa (bảng suaChua) theo từng thiết bị trong khoảng tháng/năm truyền vào,
  // sắp xếp giảm dần theo số lần sửa (phần tử đầu tiên là thiết bị nhiều nhất).
  async thietBiSuaChuaNhieuNhat(dto: ThongKeThietBiSuaChuaDto) {
    const { thang, nam } = dto;
    const from = new Date(Date.UTC(nam, thang - 1, 1));
    const to = new Date(Date.UTC(nam, thang, 0, 23, 59, 59, 999));

    const grouped = await this.prisma.suaChua.groupBy({
      by: ['thietBiId'],
      where: {
        isDelete: false,
        thietBiId: { not: null },
        ngaySuaChua: { gte: from, lte: to },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const thietBiIds = grouped.map((g) => g.thietBiId!).filter((id) => id != null);
    const thietBiList = thietBiIds.length
      ? await this.prisma.thietBi.findMany({ where: { thietBiId: { in: thietBiIds } } })
      : [];
    const thietBiMap = new Map(thietBiList.map((tb) => [tb.thietBiId, tb]));

    const data = grouped.map((g) => ({
      thietBiId: g.thietBiId,
      thietBi: thietBiMap.get(g.thietBiId!) ?? null,
      soLanSuaChua: g._count.id,
    }));

    return {
      thang,
      nam,
      thietBiNhieuNhat: data[0] ?? null,
      data,
    };
  }

}
