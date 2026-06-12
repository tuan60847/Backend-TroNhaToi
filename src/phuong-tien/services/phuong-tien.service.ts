import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhuongTienDto } from '../dto/create-phuong-tien.dto';
import { UpdatePhuongTienDto } from '../dto/update-phuong-tien.dto';

@Injectable()
export class PhuongTienService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.phuongTien.findMany({
      where: { isDelete: false },
      //include: { nguoiThue: { select: { idnt: true, hoTen: true, sdt: true } }, hoaDonGuiXe: true },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.phuongTien.findFirst({
      where: { bienSo: id, isDelete: false },
      //include: { nguoiThue: { select: { idnt: true, hoTen: true, sdt: true } }, hoaDonGuiXe: true },
    });
    if (!item) throw new NotFoundException(`PhuongTien với biển số ${id} không tồn tại`);
    return item;
  }

  create(dto: CreatePhuongTienDto) {
    return this.prisma.phuongTien.create({ data: dto as any });
  }

  async update(id: string, dto: UpdatePhuongTienDto) {
    const item = await this.findOne(id);
    return this.prisma.phuongTien.update({ where: { ID: item.ID }, data: dto as any });
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    return this.prisma.phuongTien.update({ where: { ID: item.ID }, data: { isDelete: true } });
  }
}
