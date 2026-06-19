import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSuaChuaDto } from '../dto/create-sua-chua.dto';
import { UpdateSuaChuaDto } from '../dto/update-sua-chua.dto';

@Injectable()
export class SuaChuaService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.suaChua.findMany({
      where: { isDelete: false },
    //  include: { phong: { select: { phongId: true, tenPhong: true } }, hoaDonSuaChua: true },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.suaChua.findFirst({
      where: { id: id, isDelete: false },
      //include: { phong: { select: { phongId: true, tenPhong: true } }, hoaDonSuaChua: true },
    });
    if (!item) throw new NotFoundException(`SuaChua với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreateSuaChuaDto) {
    return this.prisma.suaChua.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateSuaChuaDto) {
    await this.findOne(id);
    return this.prisma.suaChua.update({ where: { id: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.suaChua.update({ where: { id: id }, data: { isDelete: true } });
  }
  getAllLoadingBalance(id?: number) {
    return this.prisma.suaChua.findMany({
      where: { isDelete: false },
      orderBy: { id: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { id: id } }
        : {}),
    });
  }

}
