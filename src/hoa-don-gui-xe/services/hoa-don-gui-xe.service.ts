import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHoaDonGuiXeDto } from '../dto/create-hoa-don-gui-xe.dto';
import { UpdateHoaDonGuiXeDto } from '../dto/update-hoa-don-gui-xe.dto';

@Injectable()
export class HoaDonGuiXeService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.hoaDonGuiXe.findMany({
      //include: { phuongTien: { include: { nguoiThue: true } } },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.hoaDonGuiXe.findUnique({
      where: { maHoaDon: id },
      //include: { phuongTien: { include: { nguoiThue: true } } },
    });
    if (!item) throw new NotFoundException(`HoaDonGuiXe với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreateHoaDonGuiXeDto) {
    return this.prisma.hoaDonGuiXe.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateHoaDonGuiXeDto) {
    await this.findOne(id);
    return this.prisma.hoaDonGuiXe.update({ where: { maHoaDon: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.hoaDonGuiXe.delete({ where: { maHoaDon: id } });
  }
}
