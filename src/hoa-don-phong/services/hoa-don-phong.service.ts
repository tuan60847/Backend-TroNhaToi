import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHoaDonPhongDto } from '../dto/create-hoa-don-phong.dto';
import { UpdateHoaDonPhongDto } from '../dto/update-hoa-don-phong.dto';

@Injectable()
export class HoaDonPhongService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.hoaDonPhong.findMany({
      //include: { hopDong: { include: { nguoiThue: true, phong: true } }, phieuThuHangThang: true },
    });
  }

  async findOne(id: number) {
    // const item = await this.prisma.hoaDonPhong.findUnique({
    //   //where: { maHoaDon: id },
    //   //include: { hopDong: { include: { nguoiThue: true, phong: true } }, phieuThuHangThang: true },
    // });
    // if (!item) throw new NotFoundException(`HoaDonPhong với id ${id} không tồn tại`);
    // return item;
  }

  create(dto: CreateHoaDonPhongDto) {
    return this.prisma.hoaDonPhong.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateHoaDonPhongDto) {
    await this.findOne(id);
    //return this.prisma.hoaDonPhong.update({ where: { maHoaDon: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.hoaDonPhong.delete({ where: { maHoaDon: id.toString() } });
  }
}
