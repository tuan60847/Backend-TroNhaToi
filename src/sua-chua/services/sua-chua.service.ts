import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSuaChuaDto } from '../dto/create-sua-chua.dto';
import { UpdateSuaChuaDto } from '../dto/update-sua-chua.dto';
import { SearchSuaChuaDto } from '../dto/search-sua-chua.dto';
import { ThongKeSnapshotService } from '../../thong-ke/services/thong-ke-snapshot.service';

@Injectable()
export class SuaChuaService {
  constructor(
    private prisma: PrismaService,
    private thongKeSnapshotService: ThongKeSnapshotService,
  ) { }

  findAll() {
    return this.prisma.suaChua.findMany({
      where: { isDelete: false },
      // include: { phong: { select: { phongId: true, tenPhong: true } }, hoaDonSuaChua: true },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.suaChua.findFirst({
      where: { id, isDelete: false },
      // include: { phong: { select: { phongId: true, tenPhong: true } }, hoaDonSuaChua: true },
    });

    if (!item) {
      throw new NotFoundException(`SuaChua với id ${id} không tồn tại`);
    }

    return item;
  }

  private async generateMaHoaDonSc(): Promise<string> {
    const now = new Date();
    const dateStr =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');
    const prefix = `SC${dateStr}`;

    const last = await this.prisma.hoaDonSuaChua.findFirst({
      where: { maHoaDonSc: { startsWith: prefix } },
      orderBy: { maHoaDonSc: 'desc' },
      select: { maHoaDonSc: true },
    });

    const nextStt = last ? parseInt(last.maHoaDonSc.slice(-3), 10) + 1 : 1;
    return `${prefix}${String(nextStt).padStart(3, '0')}`;
  }

  async create(dto: CreateSuaChuaDto) {
    const { hoaDonSuaChua, ...suaChuaData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const suaChua = await tx.suaChua.create({
        data: suaChuaData as any,
      });

      if (hoaDonSuaChua) {
        const maHoaDonSc = await this.generateMaHoaDonSc();

        await tx.hoaDonSuaChua.create({
          data: {
            maHoaDonSc,
            idSuaChua: suaChua.id,
            trangThai: hoaDonSuaChua.trangThai,
            giaTien: hoaDonSuaChua.giaTien,
            loaiSua: hoaDonSuaChua.loaiSua,
            ngayLapHoaDonSc: hoaDonSuaChua.ngayLapHoaDonSc,
          } as any,
        });
      }

      const result = await tx.suaChua.findFirst({
        where: {
          id: suaChua.id,
        },
        include: {
          hoadonsuachua: true,
          phong: true,
          thietbi: true,
        },
      });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return result;
    });
  }

  async update(id: number, dto: UpdateSuaChuaDto) {
    await this.findOne(id);

    const { hoaDonSuaChua, ...suaChuaData } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Cập nhật sửa chữa
      await tx.suaChua.update({
        where: { id },
        data: suaChuaData,
      });

      // Có gửi hóa đơn mới xử lý
      if (hoaDonSuaChua != null) {
        const hoaDon = await tx.hoaDonSuaChua.findFirst({
          where: {
            idSuaChua: id,
            isDelete: false,
          },
        });

        if (hoaDon == null) {
          // Chưa có -> thêm mới
          const maHoaDonSc = await this.generateMaHoaDonSc();

          await tx.hoaDonSuaChua.create({
            data: {
              maHoaDonSc,
              idSuaChua: id,
              trangThai: hoaDonSuaChua.trangThai,
              giaTien: hoaDonSuaChua.giaTien,
              loaiSua: hoaDonSuaChua.loaiSua,
              ngayLapHoaDonSc: hoaDonSuaChua.ngayLapHoaDonSc,
            },
          });
        } else {
          // Đã có -> cập nhật
          await tx.hoaDonSuaChua.update({
            where: {
              maHoaDonSc: hoaDon.maHoaDonSc,
            },
            data: {
              trangThai: hoaDonSuaChua.trangThai,
              giaTien: hoaDonSuaChua.giaTien,
              loaiSua: hoaDonSuaChua.loaiSua,
              ngayLapHoaDonSc: hoaDonSuaChua.ngayLapHoaDonSc,
            },
          });
        }
      }

      const result = await tx.suaChua.findFirst({
        where: { id },
        include: {
          hoadonsuachua: true,
          phong: true,
          thietbi: true,
        },
      });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return result;
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const removed = await tx.suaChua.update({
        where: { id },
        data: { isDelete: true },
      });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return removed;
    });
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

    const [data, total] = await Promise.all([
      this.prisma.suaChua.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.suaChua.count({ where }),
    ]);

    return { total, data };
  }

  getAllLoadingBalance(id?: number) {
    return this.prisma.suaChua.findMany({
      where: { isDelete: false },
      orderBy: { id: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null ? { skip: 1, cursor: { id } } : {}),
    });
  }

  async getByThietBi(thietBiId: number) {
    const data = await this.prisma.suaChua.findMany({
      where: {
        thietBiId,
        isDelete: false,
      },
      include: {
        hoadonsuachua: true,
        phong: {
          select: {
            tenPhong: true,
          },
        },
      },
      orderBy: {
        ngaySuaChua: 'desc',
      },
    });

    return data
      .sort((a, b) => {
        const aCoHoaDon = a.hoadonsuachua != null;
        const bCoHoaDon = b.hoadonsuachua != null;

        if (aCoHoaDon === bCoHoaDon) {
          return 0;
        }

        // Chưa có hóa đơn lên trước
        return aCoHoaDon ? 1 : -1;
      })
      .map(({ phong, ...item }) => ({
        ...item,
        tenPhong: phong?.tenPhong,
      }));
  }
}
