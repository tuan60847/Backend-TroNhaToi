import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateThietBiDto } from '../dto/create-thiet-bi.dto';
import { UpdateThietBiDto } from '../dto/update-thiet-bi.dto';
import { SearchThietBiDto } from '../dto/search-thiet-bi.dto';

@Injectable()
export class ThietBiService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.thietBi.findMany({
      where: { isDelete: false },
      //include: { lapRap: { include: { phong: true } } },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.thietBi.findFirst({
      where: { thietBiId: id, isDelete: false },
      //include: { lapRap: { include: { phong: true } } },
    });
    if (!item) throw new NotFoundException(`ThietBi với id ${id} không tồn tại`);
    return item;
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
    return this.prisma.thietBi.update({ where: { thietBiId: id }, data: { isDelete: true } });
  }
  async search(req: SearchThietBiDto) {
    const { q, trangThai, limit = 10, offset = 0, sortBy = 'thietBiId', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (q) {
      where.OR = [
        { tenThietBi: { contains: q } },
        { loai: { contains: q } },
      ];
    }

    if (trangThai !== undefined) {
      where.trangThai = trangThai;
    }

    const [data, total] = await Promise.all([
      this.prisma.thietBi.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.thietBi.count({ where }),
    ]);

    return { total, data };
  }

  searchByName(ten: string) {
    return this.prisma.thietBi.findMany({
      where: { tenThietBi: { contains: ten }, isDelete: false },
    });
  }

  getAllLoadingBalance(id?: number) {
    return this.prisma.thietBi.findMany({
      where: { isDelete: false },
      orderBy: { thietBiId: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { thietBiId: id } }
        : {}),
    });
  }

}
