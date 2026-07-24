import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLichSuMuaThietBiDto } from '../dto/create-lich-su-mua-thiet-bi.dto';
import { UpdateLichSuMuaThietBiDto } from '../dto/update-lich-su-mua-thiet-bi.dto';
import { SearchLichSuMuaThietBiDto } from '../dto/search-lich-su-mua-thiet-bi.dto';
import { ThongKeSnapshotService } from '../../thong-ke/services/thong-ke-snapshot.service';


@Injectable()
export class LichSuMuaThietBiService {
  constructor(
    private prisma: PrismaService,
    private thongKeSnapshotService: ThongKeSnapshotService,
  ) { }

  private transform(raw: any) {
    const { isDelete, ...rest } = raw;
    return rest;
  }

  async findAll() {
    const rows = await this.prisma.lichSuMuaThietBi.findMany({ where: { isDelete: false } });
    return rows.map((r) => this.transform(r));
  }

  async findOne(id: number) {
    const item = await this.prisma.lichSuMuaThietBi.findFirst({ where: { id, isDelete: false } });
    if (!item) throw new NotFoundException(`LichSuMuaThietBi với id ${id} không tồn tại`);
    return this.transform(item);
  }

  async create(dto: CreateLichSuMuaThietBiDto) {
    const thietBi = await this.prisma.thietBi.findFirst({
      where: { thietBiId: dto.thietBiId, isDelete: false },
    });
    if (!thietBi) throw new NotFoundException(`ThietBi với id ${dto.thietBiId} không tồn tại`);

    const created = await this.prisma.$transaction(async (tx) => {
      const result = await tx.lichSuMuaThietBi.create({
        data: {
          thietBiId: dto.thietBiId,
          soLuong: dto.soLuong,
          donGia: dto.donGia,
          ngayMua: new Date(dto.ngayMua),
          ghiChu: dto.ghiChu,
        },
      });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return result;
    });
    return this.transform(created);
  }

  async update(id: number, dto: UpdateLichSuMuaThietBiDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.ngayMua) data.ngayMua = new Date(dto.ngayMua);
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.lichSuMuaThietBi.update({ where: { id }, data });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return result;
    });
    return this.transform(updated);
  }

  async remove(id: number) {
    await this.findOne(id);
    const removed = await this.prisma.$transaction(async (tx) => {
      const result = await tx.lichSuMuaThietBi.update({
        where: { id },
        data: { isDelete: true },
      });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return result;
    });
    return this.transform(removed);
  }

  async search(req: SearchLichSuMuaThietBiDto) {
    const { q, thietBiId, limit = 10, offset = 0, sortBy = 'ngayMua', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (thietBiId !== undefined) where.thietBiId = thietBiId;
    if (q) where.ghiChu = { contains: q };

    const [rows, total] = await Promise.all([
      this.prisma.lichSuMuaThietBi.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.lichSuMuaThietBi.count({ where }),
    ]);

    return { total, data: rows.map((r) => this.transform(r)) };
  }

  async getAllLoadingBalance(id?: number) {
    const rows = await this.prisma.lichSuMuaThietBi.findMany({
      where: { isDelete: false },
      orderBy: { id: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null ? { skip: 1, cursor: { id } } : {}),
    });
    return rows.map((r) => this.transform(r));
  }

  // Tồn kho hiện tại của 1 thiết bị
  async tinhTonKho(thietBiId: number) {
    const result = await this.prisma.lichSuMuaThietBi.aggregate({
      where: { thietBiId, isDelete: false },
      _sum: { soLuong: true },
    });
    return result._sum.soLuong ?? 0;
  }

  // Tổng chi phí đã mua của 1 thiết bị
  async tinhTongChiPhi(thietBiId: number) {
    const records = await this.prisma.lichSuMuaThietBi.findMany({
      where: { thietBiId, isDelete: false },
      select: { soLuong: true, donGia: true },
    });
    return records.reduce((sum, r) => sum + r.soLuong * Number(r.donGia), 0);
  }

  // Lấy danh sách lịch sử mua theo 1 thiết bị cụ thể
  async getDSLichSuByThietBi(thietBiId: number) {
    const rows = await this.prisma.lichSuMuaThietBi.findMany({
      where: { thietBiId, isDelete: false },
      orderBy: { ngayMua: 'desc' },
    });
    return rows.map((r) => this.transform(r));
  }
}
