import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhuongTienDto } from '../dto/create-phuong-tien.dto';
import { UpdatePhuongTienDto } from '../dto/update-phuong-tien.dto';
import { SearchPhuongTienDto } from '../dto/search-phuong-tien.dto';

@Injectable()
export class PhuongTienService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.phuongTien.findMany({
      where: { isDelete: false },
      //include: { nguoiThue: { select: { idnt: true, hoTen: true, sdt: true } }, hoaDonGuiXe: true },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.phuongTien.findFirst({
      where: { bienSo: id, isDelete: false },
      //include: { nguoiThue: { select: { idnt: true, hoTen: true, sdt: true } }, hoaDonGuiXe: true },
    });
    if (!item) throw new NotFoundException(`PhuongTien với biển số ${id} không tồn tại`);
    return item;
  }

  create(dto: CreatePhuongTienDto) {
    return this.prisma.phuongTien.create({ data: dto as any });
  }

  async update(id: string, dto: UpdatePhuongTienDto) {
    const item = await this.findOne(id);
    return this.prisma.phuongTien.update({ where: { ID: item.ID }, data: dto as any });
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    return this.prisma.phuongTien.update({ where: { ID: item.ID }, data: { isDelete: true } });
  }
  async search(req: SearchPhuongTienDto) {
    const { ma, limit = 10, offset = 0, sortBy = 'ID', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (ma) {
      where.bienSo = { contains: ma };
    }

    const [data, total] = await Promise.all([
      this.prisma.phuongTien.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.phuongTien.count({ where }),
    ]);

    return { total, data };
  }

  getAllLoadingBalance(id?: number) {
    return this.prisma.phuongTien.findMany({
      where: { isDelete: false },
      orderBy: { ID: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { ID: id } }
        : {}),
    });
  }

}
