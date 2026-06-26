import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhongDto } from '../dto/create-phong.dto';
import { UpdatePhongDto } from '../dto/update-phong.dto';
import { SearchPhongDto } from '../dto/search-phong.dto';
import { TrangThaiPhong } from '../constants/trang-thai-phong.enum';

@Injectable()
export class PhongService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.phong.findMany({
      where: { isDelete: false },
      // include: { loaiPhong: true, hopDong: { include: { nguoiThue: true } }, dienNuoc: true, lapRap: { include: { thietBi: true } }, nguoiLuuTruTamThoi: true },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.phong.findFirst({
      where: { phongId: id, isDelete: false },
      // include: { loaiPhong: true, hopDong: { include: { nguoiThue: true } }, dienNuoc: true, lapRap: { include: { thietBi: true } }, nguoiLuuTruTamThoi: true },
    });
    if (!item) throw new NotFoundException(`Phong với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreatePhongDto) {
    return this.prisma.phong.create({ data: dto as any });
  }

  async update(id: number, dto: UpdatePhongDto) {
    await this.findOne(id);
    return this.prisma.phong.update({ where: { phongId: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.phong.update({ where: { phongId: id }, data: { isDelete: true } });
  }
  async search(req: SearchPhongDto) {
    const { q, trangThai, maLoaiPhong, limit = 10, offset = 0, sortBy = 'phongId', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (q) {
      where.OR = [
        { tenPhong: { contains: q } },
        { moTa: { contains: q } },
      ];
    }

    if (trangThai !== undefined) {
      where.trangThai = trangThai;
    }

    if (maLoaiPhong !== undefined) {
      where.maLoaiPhong = maLoaiPhong;
    }

    const [data, total] = await Promise.all([
      this.prisma.phong.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.phong.count({ where }),
    ]);

    return { total, data };
  }

  async updateTrangThai(id: number, trangThai: TrangThaiPhong) {
    await this.findOne(id);
    return this.prisma.phong.update({ where: { phongId: id }, data: { trangThai } });
  }

  searchByName(ten: string) {
    return this.prisma.phong.findMany({
      where: { tenPhong: { contains: ten }, isDelete: false },
    });
  }

  findNguoiThueByPhong(phongId: number) {
    return this.prisma.hopDong.findMany({
      where: { phongId, isDelete: false },
      include: { nguoithue: true },
      orderBy: { ngayKy: 'desc' },
    });
  }

  getAllLoadingBalance(id?: number) {
    return this.prisma.phong.findMany({
      where: { isDelete: false },
      orderBy: { phongId: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { phongId: id } }
        : {}),
    });
  }

}
