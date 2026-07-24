import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHangHoaDto } from '../dto/create-hang-hoa.dto';
import { UpdateHangHoaDto } from '../dto/update-hang-hoa.dto';
import { SearchHangHoaDto } from '../dto/search-hang-hoa.dto';
import { ThongKeSnapshotService } from '../../thong-ke/services/thong-ke-snapshot.service';

@Injectable()
export class HangHoaService {
  constructor(
    private prisma: PrismaService,
    private thongKeSnapshotService: ThongKeSnapshotService,
  ) {}

  findAll() {
    return this.prisma.hangHoa.findMany({
      where: { isDelete: false },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.hangHoa.findFirst({
      where: { maHangHoa: id, isDelete: false },
    });
    if (!item) throw new NotFoundException(`HangHoa với id ${id} không tồn tại`);
    return item;
  }

  async create(dto: CreateHangHoaDto) {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.hangHoa.create({ data: dto as any });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return created;
    });
  }

  async update(id: number, dto: UpdateHangHoaDto) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.hangHoa.update({
        where: { maHangHoa: id },
        data: dto as any,
      });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return updated;
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const removed = await tx.hangHoa.update({
        where: { maHangHoa: id },
        data: { isDelete: true },
      });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return removed;
    });
  }
  async search(req: SearchHangHoaDto) {
    const { q, limit = 10, offset = 0, sortBy = 'maHangHoa', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (q) {
      where.tenHangHoa = { contains: q };
    }

    const [data, total] = await Promise.all([
      this.prisma.hangHoa.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.hangHoa.count({ where }),
    ]);

    return { total, data };
  }

  searchByName(ten: string) {
    return this.prisma.hangHoa.findMany({
      where: { tenHangHoa: { contains: ten }, isDelete: false },
    });
  }

  getAllLoadingBalance(id?: number) {
    return this.prisma.hangHoa.findMany({
      where: { isDelete: false },
      orderBy: { maHangHoa: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { maHangHoa: id } }
        : {}),
    });
  }

}
