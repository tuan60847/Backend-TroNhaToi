import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDienNuocDto } from '../dto/create-dien-nuoc.dto';
import { UpdateDienNuocDto } from '../dto/update-dien-nuoc.dto';

@Injectable()
export class DienNuocService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.dienNuoc.findMany({
      include: { phong: { select: { phongId: true, tenPhong: true } } },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.dienNuoc.findUnique({
      where: { idDienNuoc: id },
      include: { phong: { select: { phongId: true, tenPhong: true } } },
    });
    if (!item) throw new NotFoundException(`DienNuoc với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreateDienNuocDto) {
    return this.prisma.dienNuoc.create({ data: dto as any });
  }

  async update(id: string, dto: UpdateDienNuocDto) {
    await this.findOne(id);
    return this.prisma.dienNuoc.update({ where: { idDienNuoc: id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.dienNuoc.delete({ where: { idDienNuoc: id } });
  }
}
