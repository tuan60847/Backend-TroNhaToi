import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhieuThuHangThangDto } from '../dto/create-phieu-thu-hang-thang.dto';
import { UpdatePhieuThuHangThangDto } from '../dto/update-phieu-thu-hang-thang.dto';

@Injectable()
export class PhieuThuHangThangService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.phieuThuHangThang.findMany({
     // include: { hoaDonPhong: { include: { hopDong: { include: { nguoiThue: true, phong: true } } } } },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.phieuThuHangThang.findUnique({
      where: { maPhieuThu: id },
      // include: { hoaDonPhong: { include: { hopDong: { include: { nguoiThue: true, phong: true } } } } },
    });
    if (!item) throw new NotFoundException(`PhieuThuHangThang với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreatePhieuThuHangThangDto) {
    return this.prisma.phieuThuHangThang.create({ data: dto as any });
  }

  async update(id: number, dto: UpdatePhieuThuHangThangDto) {
    await this.findOne(id);
    return this.prisma.phieuThuHangThang.update({ where: { maPhieuThu: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.phieuThuHangThang.delete({ where: { maPhieuThu: id } });
  }
}
