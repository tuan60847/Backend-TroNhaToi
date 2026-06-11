import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNguoiLuuTruTamThoiDto } from '../dto/create-nguoi-luu-tru-tam-thoi.dto';
import { UpdateNguoiLuuTruTamThoiDto } from '../dto/update-nguoi-luu-tru-tam-thoi.dto';

@Injectable()
export class NguoiLuuTruTamThoiService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.nguoiLuuTruTamThoi.findMany({
      //include: { phong: { select: { phongId: true, tenPhong: true } } },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.nguoiLuuTruTamThoi.findUnique({
      where: { idtt: id },
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
    return this.prisma.nguoiLuuTruTamThoi.delete({ where: { idtt: id } });
  }
}
