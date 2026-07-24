import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHoaDonSuaChuaDto } from '../dto/create-hoa-don-sua-chua.dto';
import { UpdateHoaDonSuaChuaDto } from '../dto/update-hoa-don-sua-chua.dto';
import { SearchHoaDonSuaChuaDto } from '../dto/search-hoa-don-sua-chua.dto';
import { TrangThaiHoaDonSuaChua } from '../constants/trang-thai-hoa-don-sua-chua.enum';
import { ThongKeSnapshotService } from '../../thong-ke/services/thong-ke-snapshot.service';

@Injectable()
export class HoaDonSuaChuaService {
  constructor(
    private prisma: PrismaService,
    private thongKeSnapshot: ThongKeSnapshotService,
  ) {}

  findAll() {
    return this.prisma.hoaDonSuaChua.findMany({
      where: { isDelete: false },
     // include: { suachua: { include: { phong: true } } },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.hoaDonSuaChua.findFirst({
      where: { maHoaDonSc: id, isDelete: false },
      // include: { suaChua: { include: { phong: true } } },
    });
    if (!item) throw new NotFoundException(`HoaDonSuaChua với id ${id} không tồn tại`);
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

  async create(dto: CreateHoaDonSuaChuaDto) {
    const maHoaDonSc = await this.generateMaHoaDonSc();

    return this.prisma.$transaction(async (tx) => {
      const result = await tx.hoaDonSuaChua.create({
        data: {
          maHoaDonSc,
          ...dto,
        } as any,
      });
      await this.thongKeSnapshot.invalidateAll(tx);
      return result;
    });
  }

  async update(id: string, dto: UpdateHoaDonSuaChuaDto) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.hoaDonSuaChua.update({
        where: { maHoaDonSc: id },
        data: dto as any,
      });
      await this.thongKeSnapshot.invalidateAll(tx);
      return result;
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.hoaDonSuaChua.update({
        where: { maHoaDonSc: id },
        data: { isDelete: true },
      });
      await this.thongKeSnapshot.invalidateAll(tx);
      return result;
    });
  }
  async search(req: SearchHoaDonSuaChuaDto) {
    const { trangThai, loaiSua, idSuaChua, limit = 10, offset = 0, sortBy = 'maHoaDonSc', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (trangThai !== undefined) {
      where.trangThai = trangThai;
    }

    if (loaiSua !== undefined) {
      where.loaiSua = loaiSua;
    }

    if (idSuaChua !== undefined) {
      where.idSuaChua = idSuaChua;
    }

    const [data, total] = await Promise.all([
      this.prisma.hoaDonSuaChua.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.hoaDonSuaChua.count({ where }),
    ]);

    return { total, data };
  }

  async updateTrangThai(id: string, trangThai: TrangThaiHoaDonSuaChua) {
    const item = await this.findOne(id);
    if (item.trangThai === TrangThaiHoaDonSuaChua.HOAN_THANH) {
      throw new BadRequestException('Hóa đơn sửa chữa đã hoàn thành, không thể đổi trạng thái');
    }
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.hoaDonSuaChua.update({
        where: { maHoaDonSc: id },
        data: { trangThai },
      });
      await this.thongKeSnapshot.invalidateAll(tx);
      return result;
    });
  }

  getAllLoadingBalance(id?: string) {
    return this.prisma.hoaDonSuaChua.findMany({
      where: { isDelete: false },
      orderBy: { maHoaDonSc: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { maHoaDonSc: id } }
        : {}),
    });
  }

}
