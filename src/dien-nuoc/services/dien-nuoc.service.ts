import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDienNuocDto } from '../dto/create-dien-nuoc.dto';
import { UpdateDienNuocDto } from '../dto/update-dien-nuoc.dto';
import { SearchDienNuocDto } from '../dto/search-dien-nuoc.dto';
import { generateId } from '../../common/utils/generate-id.util';

@Injectable()
export class DienNuocService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.dienNuoc.findMany({
      where: { isDelete: false },
      include: { phong: { select: { phongId: true, tenPhong: true } } },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.dienNuoc.findFirst({
      where: { idDienNuoc: id, isDelete: false },
      include: { phong: { select: { phongId: true, tenPhong: true } } },
    });
    if (!item) throw new NotFoundException(`DienNuoc với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreateDienNuocDto) {
    return this.prisma.dienNuoc.create({
      data: { idDienNuoc: generateId('DN', 12), ...dto } as any,
    });
  }

  async update(id: string, dto: UpdateDienNuocDto) {
    await this.findOne(id);
    return this.prisma.dienNuoc.update({ where: { idDienNuoc: id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.dienNuoc.update({ where: { idDienNuoc: id }, data: { isDelete: true } });
  }
  async search(req: SearchDienNuocDto) {
    const { ma, limit = 10, offset = 0, sortBy = 'idDienNuoc', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (ma) {
      where.idDienNuoc = { contains: ma };
    }

    const [data, total] = await Promise.all([
      this.prisma.dienNuoc.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.dienNuoc.count({ where }),
    ]);

    return { total, data };
  }

  getAllLoadingBalance(id?: string) {
    return this.prisma.dienNuoc.findMany({
      where: { isDelete: false },
      orderBy: { idDienNuoc: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { idDienNuoc: id } }
        : {}),
    });
  }

}
