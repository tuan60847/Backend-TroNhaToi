import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHoaDonTapHoaDto } from '../dto/create-hoa-don-tap-hoa.dto';
import { UpdateHoaDonTapHoaDto } from '../dto/update-hoa-don-tap-hoa.dto';

@Injectable()
export class HoaDonTapHoaService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.hoaDonTapHoa.findMany({
      include: { nguoiThue: true, chiTietTapHoa: { include: { hangHoa: true } }, phieuThuHdTh: true },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.hoaDonTapHoa.findUnique({
      where: { maHoaDon: id.toString() },
      include: { nguoiThue: true, chiTietTapHoa: { include: { hangHoa: true } }, phieuThuHdTh: true },
    });
    if (!item) throw new NotFoundException(`HoaDonTapHoa với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreateHoaDonTapHoaDto) {
    return this.prisma.hoaDonTapHoa.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateHoaDonTapHoaDto) {
    await this.findOne(id);
    return this.prisma.hoaDonTapHoa.update({ where: { maHoaDon: id.toString() }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.hoaDonTapHoa.delete({ where: { maHoaDon: id.toString() } });
  }
}
