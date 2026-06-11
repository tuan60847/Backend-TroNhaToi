import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLoaiPhongDto } from '../dto/create-loai-phong.dto';
import { UpdateLoaiPhongDto } from '../dto/update-loai-phong.dto';

@Injectable()
export class LoaiPhongService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.loaiPhong.findMany({
      include: { phong: { select: { phongId: true, tenPhong: true, trangThai: true } } },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.loaiPhong.findUnique({
      where: { maLoaiPhong: id },
      include: { phong: { select: { phongId: true, tenPhong: true, trangThai: true } } },
    });
    if (!item) throw new NotFoundException(`LoaiPhong với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreateLoaiPhongDto) {
    return this.prisma.loaiPhong.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateLoaiPhongDto) {
    await this.findOne(id);
    return this.prisma.loaiPhong.update({ where: { maLoaiPhong: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.loaiPhong.delete({ where: { maLoaiPhong: id } });
  }
}
