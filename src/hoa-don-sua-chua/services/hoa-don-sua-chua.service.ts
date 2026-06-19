import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHoaDonSuaChuaDto } from '../dto/create-hoa-don-sua-chua.dto';
import { UpdateHoaDonSuaChuaDto } from '../dto/update-hoa-don-sua-chua.dto';
import { SearchHoaDonSuaChuaDto } from '../dto/search-hoa-don-sua-chua.dto';
import { TrangThaiHoaDonSuaChua } from '../constants/trang-thai-hoa-don-sua-chua.enum';

@Injectable()
export class HoaDonSuaChuaService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.hoaDonSuaChua.findMany({
      where: { isDelete: false },
     // include: { suachua: { include: { phong: true } } },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.hoaDonSuaChua.findFirst({
      where: { maHoaDonSc: id, isDelete: false },
      // include: { suaChua: { include: { phong: true } } },
    });
    if (!item) throw new NotFoundException(`HoaDonSuaChua với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreateHoaDonSuaChuaDto) {
    return this.prisma.hoaDonSuaChua.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateHoaDonSuaChuaDto) {
    await this.findOne(id);
    return this.prisma.hoaDonSuaChua.update({ where: { maHoaDonSc: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.hoaDonSuaChua.update({ where: { maHoaDonSc: id }, data: { isDelete: true } });
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

  async updateTrangThai(id: number, trangThai: TrangThaiHoaDonSuaChua) {
    const item = await this.findOne(id);
    if (item.trangThai === TrangThaiHoaDonSuaChua.HOAN_THANH) {
      throw new BadRequestException('Hóa đơn sửa chữa đã hoàn thành, không thể đổi trạng thái');
    }
    return this.prisma.hoaDonSuaChua.update({ where: { maHoaDonSc: id }, data: { trangThai } });
  }

  getAllLoadingBalance(id?: number) {
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
