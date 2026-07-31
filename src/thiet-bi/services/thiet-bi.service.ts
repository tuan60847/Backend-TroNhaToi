import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateThietBiDto } from '../dto/create-thiet-bi.dto';
import { UpdateThietBiDto } from '../dto/update-thiet-bi.dto';
import { SearchThietBiDto } from '../dto/search-thiet-bi.dto';
import { ThongKeSnapshotService } from '../../thong-ke/services/thong-ke-snapshot.service';

@Injectable()
export class ThietBiService {
  constructor(
    private prisma: PrismaService,
    private thongKeSnapshotService: ThongKeSnapshotService,
  ) { }

  private transform(raw: any) {
    const { thietBiId, isDelete, ...rest } = raw;
    return { ...rest, thietBiID: thietBiId };
  }

  async findAll() {
    const rows = await this.prisma.thietBi.findMany({
      where: {
        isDelete: false,
      },
      include: {
        lichSuMua: {
          where: {
            isDelete: false,
          },
          select: {
            soLuong: true,
          },
        },
        laprap: {
          where: {
            isDelete: false,
          },
          select: {
            soLuong: true,
          },
        },
      },
    });

    return rows.map((r) => {
      const soLuongMua = r.lichSuMua.reduce(
        (tong, item) => tong + (item.soLuong ?? 0),
        0,
      );

      const soLuongLapDat = r.laprap.reduce(
        (tong, item) => tong + (item.soLuong ?? 0),
        0,
      );

      const { lichSuMua, laprap, ...thietBi } = r;

      return {
        ...this.transform(thietBi),
        soLuongMua,
        soLuongLapDat,
      };
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.thietBi.findFirst({ where: { thietBiId: id, isDelete: false } });
    if (!item) throw new NotFoundException(`ThietBi với id ${id} không tồn tại`);
    return this.transform(item);
  }

  async create(dto: CreateThietBiDto) {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.thietBi.create({ data: dto as any });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return created;
    });
  }

  async update(id: number, dto: UpdateThietBiDto) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.thietBi.update({
        where: { thietBiId: id },
        data: dto as any,
      });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return updated;
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const removed = await tx.thietBi.update({
        where: { thietBiId: id },
        data: { isDelete: true },
      });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return removed;
    });
  }
  async search(req: SearchThietBiDto) {
    const { q, trangThai, limit = 10, offset = 0, sortBy = 'thietBiId', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (q) {
      where.OR = [
        { tenThietBi: { contains: q } },
        { loai: { contains: q } },
      ];
    }

    if (trangThai !== undefined) {
      where.trangThai = trangThai;
    }

    const [rows, total] = await Promise.all([
      this.prisma.thietBi.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.thietBi.count({ where }),
    ]);

    return { total, data: rows.map((r) => this.transform(r)) };
  }

  async searchByName(ten: string) {
    const rows = await this.prisma.thietBi.findMany({
      where: { tenThietBi: { contains: ten }, isDelete: false },
    });
    return rows.map((r) => this.transform(r));
  }

  async getAllLoadingBalance(id?: number) {
    const rows = await this.prisma.thietBi.findMany({
      where: { isDelete: false },
      orderBy: { thietBiId: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { thietBiId: id } }
        : {}),
    });
    return rows.map((r) => this.transform(r));
  }


  //LẤY DANH SÁCH LẮP RÁP THIẾT BỊ THEO PHÒNG
  async getThietBiByPhongId(phongId: number) {
    const phong = await this.prisma.phong.findFirst({
      where: { phongId, isDelete: false },
    });

    if (!phong) {
      throw new NotFoundException(`Phòng với ID ${phongId} không tồn tại`);
    }

    const [dsLapRap, dsSuaChua] = await Promise.all([
      this.prisma.lapRap.findMany({
        where: {
          phongId,
          isDelete: false,
          thietbi: { isDelete: false },
        },
        include: { thietbi: true },
        orderBy: { id: 'desc' },
      }),

      this.prisma.suaChua.findMany({
        where: {
          phongId,
          isDelete: false,
        },
        include: {
          hoadonsuachua: true,
        },
      }),
    ]);

    const thongKeSuaChua = new Map<number, { dangSua: number; hong: number }>();

    for (const sc of dsSuaChua) {
      if (sc.thietBiId == null) continue;

      // Coi hóa đơn đã bị xóa như KHÔNG có hóa đơn
      const hoaDon =
        sc.hoadonsuachua && !sc.hoadonsuachua.isDelete
          ? sc.hoadonsuachua
          : null;

      const current =
        thongKeSuaChua.get(sc.thietBiId) ?? { dangSua: 0, hong: 0 };

      if (hoaDon?.trangThai === 3) {
        current.hong += 1;
      } else if (!hoaDon || hoaDon.trangThai === 0) {
        current.dangSua += 1;
      }
      // trangThai === 1 hoặc 2: không tính vào đang sửa/hỏng

      thongKeSuaChua.set(sc.thietBiId, current);
    }

    return dsLapRap.map((item) => {
      const { thietbi, isDelete, ...lapRapRest } = item;

      const thongKe = thietbi
        ? (thongKeSuaChua.get(thietbi.thietBiId) ?? { dangSua: 0, hong: 0 })
        : { dangSua: 0, hong: 0 };

      return {
        ...lapRapRest,
        thietBi: thietbi ? this.transform(thietbi) : null,
        soLuongDangSua: thongKe.dangSua,
        soLuongHong: thongKe.hong,
      };
    });
  }

}
