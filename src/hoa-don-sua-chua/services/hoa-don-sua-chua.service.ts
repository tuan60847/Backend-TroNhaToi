import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHoaDonSuaChuaDto } from '../dto/create-hoa-don-sua-chua.dto';
import { UpdateHoaDonSuaChuaDto } from '../dto/update-hoa-don-sua-chua.dto';

@Injectable()
export class HoaDonSuaChuaService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.hoaDonSuaChua.findMany({
     // include: { suachua: { include: { phong: true } } },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.hoaDonSuaChua.findUnique({
      where: { maHoaDonSc: id },
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
    return this.prisma.hoaDonSuaChua.delete({ where: { maHoaDonSc: id } });
  }
}
