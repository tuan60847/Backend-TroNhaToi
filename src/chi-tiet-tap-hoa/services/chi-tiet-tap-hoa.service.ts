import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChiTietTapHoaDto } from '../dto/create-chi-tiet-tap-hoa.dto';
import { UpdateChiTietTapHoaDto } from '../dto/update-chi-tiet-tap-hoa.dto';

@Injectable()
export class ChiTietTapHoaService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.chiTietTapHoa.findMany({
      include: { hoaDonTapHoa: true, hangHoa: true },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.chiTietTapHoa.findUnique({
      where: { maChiTietHoaDon: id },
      include: { hoaDonTapHoa: true, hangHoa: true },
    });
    if (!item) throw new NotFoundException(`ChiTietTapHoa với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreateChiTietTapHoaDto) {
    return this.prisma.chiTietTapHoa.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateChiTietTapHoaDto) {
    await this.findOne(id);
    return this.prisma.chiTietTapHoa.update({ where: { maChiTietHoaDon: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.chiTietTapHoa.delete({ where: { maChiTietHoaDon: id } });
  }
}
