import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChiTietTapHoaDto } from '../dto/create-chi-tiet-tap-hoa.dto';
import { UpdateChiTietTapHoaDto } from '../dto/update-chi-tiet-tap-hoa.dto';
import { ThongKeSnapshotService } from '../../thong-ke/services/thong-ke-snapshot.service';

@Injectable()
export class ChiTietTapHoaService {
  constructor(
    private prisma: PrismaService,
    private thongKeSnapshot: ThongKeSnapshotService,
  ) {}

  findAll() {
    return this.prisma.chiTietTapHoa.findMany({
      include: { hoaDonTapHoa: true, hangHoa: true },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.chiTietTapHoa.findUnique({
      where: { maChiTietHoaDon: id },
      include: { hoaDonTapHoa: true, hangHoa: true },
    });
    if (!item) throw new NotFoundException(`ChiTietTapHoa với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreateChiTietTapHoaDto) {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.chiTietTapHoa.create({ data: dto as any });
      await this.thongKeSnapshot.invalidateAll(tx);
      return result;
    });
  }

  async update(id: number, dto: UpdateChiTietTapHoaDto) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.chiTietTapHoa.update({
        where: { maChiTietHoaDon: id },
        data: dto as any,
      });
      await this.thongKeSnapshot.invalidateAll(tx);
      return result;
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.chiTietTapHoa.delete({
        where: { maChiTietHoaDon: id },
      });
      await this.thongKeSnapshot.invalidateAll(tx);
      return result;
    });
  }

  async findByMaHoaDon(maHoaDon: string) {
    return this.prisma.chiTietTapHoa.findMany({
      where: {
        maHoaDon: maHoaDon,
      },
      include: {
        hangHoa: true,
        hoaDonTapHoa: true,
      },
    });
  }
}
