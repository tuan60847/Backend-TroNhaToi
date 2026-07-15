import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhieuThuHdThDto } from '../dto/create-phieu-thu-hdth.dto';
import { UpdatePhieuThuHdThDto } from '../dto/update-phieu-thu-hdth.dto';
import { SearchPhieuThuHdThDto } from '../dto/search-phieu-thu-hdth.dto';

@Injectable()
export class PhieuThuHdThService {
  constructor(private prisma: PrismaService) { }

  findAll() {
    return this.prisma.phieuThuHdTh.findMany({
      where: { isDelete: false },
      include: { hoaDonTapHoa: { include: { nguoiThue: true } } },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.phieuThuHdTh.findFirst({
      where: { maPhieuThu: id, isDelete: false },
      include: { hoaDonTapHoa: { include: { nguoiThue: true } } },
    });
    if (!item) throw new NotFoundException(`PhieuThuHdTh với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreatePhieuThuHdThDto) {
    return this.prisma.phieuThuHdTh.create({ data: dto as any });
  }

  async update(id: number, dto: UpdatePhieuThuHdThDto) {
    await this.findOne(id);
    return this.prisma.phieuThuHdTh.update({ where: { maPhieuThu: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.phieuThuHdTh.update({ where: { maPhieuThu: id }, data: { isDelete: true } });
  }
  async search(req: SearchPhieuThuHdThDto) {
    const { ma, limit = 10, offset = 0, sortBy = 'maPhieuThu', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (ma) {
      where.maHoaDon = { contains: ma };
    }

    const [data, total] = await Promise.all([
      this.prisma.phieuThuHdTh.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.phieuThuHdTh.count({ where }),
    ]);

    return { total, data };
  }

  getAllLoadingBalance(id?: number) {
    return this.prisma.phieuThuHdTh.findMany({
      where: { isDelete: false },
      orderBy: { maPhieuThu: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { maPhieuThu: id } }
        : {}),
    });
  }

  async findByMaHoaDon(maHoaDon: string) {
    return this.prisma.phieuThuHdTh.findMany({
      where: {
        maHoaDon: maHoaDon,
      },
      
    });
  }

}
