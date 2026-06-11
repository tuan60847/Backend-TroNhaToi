import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhieuThuHdThDto } from '../dto/create-phieu-thu-hdth.dto';
import { UpdatePhieuThuHdThDto } from '../dto/update-phieu-thu-hdth.dto';

@Injectable()
export class PhieuThuHdThService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.phieuThuHdTh.findMany({
      include: { hoaDonTapHoa: { include: { nguoiThue: true } } },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.phieuThuHdTh.findUnique({
      where: { maPhieuThu: id },
      include: { hoaDonTapHoa: { include: { nguoiThue: true } } },
    });
    if (!item) throw new NotFoundException(`PhieuThuHdTh với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreatePhieuThuHdThDto) {
    return this.prisma.phieuThuHdTh.create({ data: dto as any });
  }

  async update(id: number, dto: UpdatePhieuThuHdThDto) {
    await this.findOne(id);
    return this.prisma.phieuThuHdTh.update({ where: { maPhieuThu: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.phieuThuHdTh.delete({ where: { maPhieuThu: id } });
  }
}
