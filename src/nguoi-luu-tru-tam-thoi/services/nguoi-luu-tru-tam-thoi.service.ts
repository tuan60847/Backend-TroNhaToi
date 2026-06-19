import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNguoiLuuTruTamThoiDto } from '../dto/create-nguoi-luu-tru-tam-thoi.dto';
import { UpdateNguoiLuuTruTamThoiDto } from '../dto/update-nguoi-luu-tru-tam-thoi.dto';
import { SearchNguoiLuuTruTamThoiDto } from '../dto/search-nguoi-luu-tru-tam-thoi.dto';

@Injectable()
export class NguoiLuuTruTamThoiService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.nguoiLuuTruTamThoi.findMany({
      where: { isDelete: false },
      //include: { phong: { select: { phongId: true, tenPhong: true } } },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.nguoiLuuTruTamThoi.findFirst({
      where: { idtt: id, isDelete: false },
      // include: { phong: { select: { phongId: true, tenPhong: true } } },
    });
    if (!item) throw new NotFoundException(`NguoiLuuTruTamThoi với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreateNguoiLuuTruTamThoiDto) {
    return this.prisma.nguoiLuuTruTamThoi.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateNguoiLuuTruTamThoiDto) {
    await this.findOne(id);
    return this.prisma.nguoiLuuTruTamThoi.update({ where: { idtt: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.nguoiLuuTruTamThoi.update({ where: { idtt: id }, data: { isDelete: true } });
  }
  async search(req: SearchNguoiLuuTruTamThoiDto) {
    const { q, limit = 10, offset = 0, sortBy = 'idtt', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (q) {
      where.OR = [
        { hoTen: { contains: q } },
        { cccd: { contains: q } },
        { sdt: { contains: q } },
        { queQuan: { contains: q } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.nguoiLuuTruTamThoi.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.nguoiLuuTruTamThoi.count({ where }),
    ]);

    return { total, data };
  }

  searchByName(ten: string) {
    return this.prisma.nguoiLuuTruTamThoi.findMany({
      where: { hoTen: { contains: ten }, isDelete: false },
    });
  }

  getAllLoadingBalance(id?: number) {
    return this.prisma.nguoiLuuTruTamThoi.findMany({
      where: { isDelete: false },
      orderBy: { idtt: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { idtt: id } }
        : {}),
    });
  }

}
