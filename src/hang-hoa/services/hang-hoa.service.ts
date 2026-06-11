import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHangHoaDto } from '../dto/create-hang-hoa.dto';
import { UpdateHangHoaDto } from '../dto/update-hang-hoa.dto';

@Injectable()
export class HangHoaService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.hangHoa.findMany({
      include: undefined,
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.hangHoa.findUnique({
      where: { maHangHoa: id },
      include: undefined,
    });
    if (!item) throw new NotFoundException(`HangHoa với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreateHangHoaDto) {
    return this.prisma.hangHoa.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateHangHoaDto) {
    await this.findOne(id);
    return this.prisma.hangHoa.update({ where: { maHangHoa: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.hangHoa.delete({ where: { maHangHoa: id } });
  }
}
