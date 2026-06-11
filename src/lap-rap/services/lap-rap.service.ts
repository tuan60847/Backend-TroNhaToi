import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLapRapDto } from '../dto/create-lap-rap.dto';
import { UpdateLapRapDto } from '../dto/update-lap-rap.dto';

@Injectable()
export class LapRapService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.lapRap.findMany({
      //include: { phong: { select: { phongId: true, tenPhong: true } }, thietBi: true },
    });
  }

  async findOne(id: number) {
    // const item = await this.prisma.lapRap.findUnique({
    //   where: { id: id },
    //   include: { phong: { select: { phongId: true, tenPhong: true } }, thietBi: true },
    // });
    // if (!item) throw new NotFoundException(`LapRap với id ${id} không tồn tại`);
    // return item;
    return null;
  }

  create(dto: CreateLapRapDto) {
    return this.prisma.lapRap.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateLapRapDto) {
    await this.findOne(id);
    return this.prisma.lapRap.update({ where: { id: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.lapRap.delete({ where: { id: id } });
  }
}
