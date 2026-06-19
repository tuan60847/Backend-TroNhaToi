import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLoaiPhongDto } from '../dto/create-loai-phong.dto';
import { UpdateLoaiPhongDto } from '../dto/update-loai-phong.dto';
import { SearchLoaiPhongDto } from '../dto/search-loai-phong.dto';

@Injectable()
export class LoaiPhongService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.loaiPhong.findMany({
      where: { isDelete: false },
      include: { phong: { select: { phongId: true, tenPhong: true, trangThai: true } } },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.loaiPhong.findFirst({
      where: { maLoaiPhong: id, isDelete: false },
      include: { phong: { select: { phongId: true, tenPhong: true, trangThai: true } } },
    });
    if (!item) throw new NotFoundException(`LoaiPhong với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreateLoaiPhongDto) {
    return this.prisma.loaiPhong.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateLoaiPhongDto) {
    await this.findOne(id);
    return this.prisma.loaiPhong.update({ where: { maLoaiPhong: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.loaiPhong.update({ where: { maLoaiPhong: id }, data: { isDelete: true } });
  }
  async search(req: SearchLoaiPhongDto) {
    const { q, limit = 10, offset = 0, sortBy = 'maLoaiPhong', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (q) {
      where.tenLoaiPhong = { contains: q };
    }

    const [data, total] = await Promise.all([
      this.prisma.loaiPhong.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.loaiPhong.count({ where }),
    ]);

    return { total, data };
  }

  searchByName(ten: string) {
    return this.prisma.loaiPhong.findMany({
      where: { tenLoaiPhong: { contains: ten }, isDelete: false },
    });
  }

  getAllLoadingBalance(id?: number) {
    return this.prisma.loaiPhong.findMany({
      where: { isDelete: false },
      orderBy: { maLoaiPhong: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { maLoaiPhong: id } }
        : {}),
    });
  }

}
