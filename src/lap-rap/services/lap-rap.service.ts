import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLapRapDto } from '../dto/create-lap-rap.dto';
import { UpdateLapRapDto } from '../dto/update-lap-rap.dto';
import { SearchLapRapDto } from '../dto/search-lap-rap.dto';

@Injectable()
export class LapRapService {
  constructor(private prisma: PrismaService) {}

  private transform(raw: any) {
    const { phongId, thietBiId, isDelete, ...rest } = raw;
    return { ...rest, PhongID: phongId, thietBiID: thietBiId };
  }

  async findAll() {
    const rows = await this.prisma.lapRap.findMany({ where: { isDelete: false } });
    return rows.map((r) => this.transform(r));
  }

  async findOne(id: number) {
    const item = await this.prisma.lapRap.findFirst({ where: { id, isDelete: false } });
    if (!item) throw new NotFoundException(`LapRap với id ${id} không tồn tại`);
    return this.transform(item);
  }

  create(dto: CreateLapRapDto) {
    return this.prisma.lapRap.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateLapRapDto) {
    await this.findOne(id);
    return this.prisma.lapRap.update({ where: { id: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.lapRap.update({ where: { id: id }, data: { isDelete: true } });
  }
  async search(req: SearchLapRapDto) {
    const { phongId, thietBiId, limit = 10, offset = 0, sortBy = 'id', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (phongId !== undefined) {
      where.phongId = phongId;
    }

    if (thietBiId !== undefined) {
      where.thietBiId = thietBiId;
    }

    const [rows, total] = await Promise.all([
      this.prisma.lapRap.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.lapRap.count({ where }),
    ]);

    return { total, data: rows.map((r) => this.transform(r)) };
  }

  async getAllLoadingBalance(id?: number) {
    const rows = await this.prisma.lapRap.findMany({
      where: { isDelete: false },
      orderBy: { id: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { id } }
        : {}),
    });
    return rows.map((r) => this.transform(r));
  }

}
