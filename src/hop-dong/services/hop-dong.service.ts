import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHopDongDto } from '../dto/create-hop-dong.dto';
import { UpdateHopDongDto } from '../dto/update-hop-dong.dto';

@Injectable()
export class HopDongService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.hopDong.findMany({
      //include: { nguoiThue: true, phong: { include: { loaiPhong: true } }, hoaDonPhong: true },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.hopDong.findUnique({
      where: { hopDongId: id.toString() },
      //include: { nguoiThue: true, phong: { include: { loaiPhong: true } }, hoaDonPhong: true },
    });
    if (!item) throw new NotFoundException(`HopDong với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreateHopDongDto) {
    return this.prisma.hopDong.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateHopDongDto) {
    await this.findOne(id);
    return this.prisma.hopDong.update({ where: { hopDongId: id.toString() }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.hopDong.delete({ where: { hopDongId: id.toString() } });
  }
}
