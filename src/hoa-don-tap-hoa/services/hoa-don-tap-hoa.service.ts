import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHoaDonTapHoaDto } from '../dto/create-hoa-don-tap-hoa.dto';
import { UpdateHoaDonTapHoaDto } from '../dto/update-hoa-don-tap-hoa.dto';
import { SearchHoaDonTapHoaDto } from '../dto/search-hoa-don-tap-hoa.dto';
import { generateId } from '../../common/utils/generate-id.util';

@Injectable()
export class HoaDonTapHoaService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.hoaDonTapHoa.findMany({
      where: { isDelete: false },
      include: { nguoiThue: true, chiTietTapHoa: { include: { hangHoa: true } }, phieuThuHdTh: true },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.hoaDonTapHoa.findFirst({
      where: { maHoaDon: id, isDelete: false },
      include: { nguoiThue: true, chiTietTapHoa: { include: { hangHoa: true } }, phieuThuHdTh: true },
    });
    if (!item) throw new NotFoundException(`HoaDonTapHoa với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreateHoaDonTapHoaDto) {
    return this.prisma.hoaDonTapHoa.create({
      data: { maHoaDon: generateId('TH', 11), ...dto } as any,
    });
  }

  async update(id: string, dto: UpdateHoaDonTapHoaDto) {
    await this.findOne(id);
    return this.prisma.hoaDonTapHoa.update({ where: { maHoaDon: id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.hoaDonTapHoa.update({ where: { maHoaDon: id }, data: { isDelete: true } });
  }
  async search(req: SearchHoaDonTapHoaDto) {
    const { ma, limit = 10, offset = 0, sortBy = 'maHoaDon', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (ma) {
      where.maHoaDon = { contains: ma };
    }

    const [data, total] = await Promise.all([
      this.prisma.hoaDonTapHoa.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.hoaDonTapHoa.count({ where }),
    ]);

    return { total, data };
  }

  getAllLoadingBalance(id?: string) {
    return this.prisma.hoaDonTapHoa.findMany({
      where: { isDelete: false },
      orderBy: { maHoaDon: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { maHoaDon: id } }
        : {}),
    });
  }

}
