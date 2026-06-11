import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateThietBiDto } from '../dto/create-thiet-bi.dto';
import { UpdateThietBiDto } from '../dto/update-thiet-bi.dto';

@Injectable()
export class ThietBiService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.thietBi.findMany({
      //include: { lapRap: { include: { phong: true } } },
    });
  }

  async findOne(id: number) {
    // const item = await this.prisma.thietBi.findUnique({
    //   where: { thietBiId: id },
    //   include: { lapRap: { include: { phong: true } } },
    // });
    // if (!item) throw new NotFoundException(`ThietBi với id ${id} không tồn tại`);
    // return item;
    return null;
  }

  create(dto: CreateThietBiDto) {
    return this.prisma.thietBi.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateThietBiDto) {
    await this.findOne(id);
    return this.prisma.thietBi.update({ where: { thietBiId: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.thietBi.delete({ where: { thietBiId: id } });
  }
}
