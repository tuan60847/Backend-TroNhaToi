import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhuongTienDto } from '../dto/create-phuong-tien.dto';
import { UpdatePhuongTienDto } from '../dto/update-phuong-tien.dto';

@Injectable()
export class PhuongTienService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.phuongTien.findMany({
      //include: { nguoiThue: { select: { idnt: true, hoTen: true, sdt: true } }, hoaDonGuiXe: true },
    });
  }

  async findOne(id: string) {
    // const item = await this.prisma.phuongTien.findUnique({
    //   where: { bieInSo: id },
    //   //include: { nguoiThue: { select: { idnt: true, hoTen: true, sdt: true } }, hoaDonGuiXe: true },
    // });
    // if (!item) throw new NotFoundException(`PhuongTien với id ${id} không tồn tại`);
    // return item;
    return null;
  }

  create(dto: CreatePhuongTienDto) {
    return this.prisma.phuongTien.create({ data: dto as any });
  }

  async update(id: string, dto: UpdatePhuongTienDto) {
    // await this.findOne(id);
    // return this.prisma.phuongTien.update({ where: { bienSo: id }, data: dto as any });
    return null;
  }

  async remove(id: string) {
    // await this.findOne(id);
    // return this.prisma.phuongTien.delete({ where: { bienSo: id } });
    return null;  
  }
}
