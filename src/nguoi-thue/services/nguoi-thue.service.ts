import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNguoiThueDto } from '../dto/create-nguoi-thue.dto';
import { UpdateNguoiThueDto } from '../dto/update-nguoi-thue.dto';
import { SearchNguoiThueDto } from '../dto/search-nguoi-thue.dto';

@Injectable()
export class NguoiThueService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.nguoiThue.findMany({
      where: { isDelete: false },
      //include: { hopDong: { include: { phong: true } }, phuongTien: true },
    });
  }
  //Lấy tất cả người thuê bao gồm những người vừa thêm vào và chưa có hợp đồng nào và sắp xếp đẩy người mới thêm lên đầu
  async findAllNguoiThue(){
    return this.prisma.nguoiThue.findMany({
      orderBy: { idnt: 'desc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.nguoiThue.findFirst({
      where: { idnt: id, isDelete: false },
      // include: { hopDong: { include: { phong: true } }, phuongTien: true },
    });
    if (!item) throw new NotFoundException(`NguoiThue với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreateNguoiThueDto) {
    return this.prisma.nguoiThue.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateNguoiThueDto) {
    await this.findOne(id);
    return this.prisma.nguoiThue.update({ where: { idnt: id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.nguoiThue.update({ where: { idnt: id }, data: { isDelete: true } });
  }
  async search(req: SearchNguoiThueDto) {
    const { q, gioiTinh, limit = 10, offset = 0, sortBy = 'idnt', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (q) {
      where.OR = [
        { hoTen: { contains: q } },
        { cccd: { contains: q } },
        { sdt: { contains: q } },
        { queQuan: { contains: q } },
      ];
    }

    if (gioiTinh !== undefined) {
      where.gioiTinh = `${gioiTinh}` === 'true';
    }

    const [data, total] = await Promise.all([
      this.prisma.nguoiThue.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.nguoiThue.count({ where }),
    ]);

    return { total, data };
  }

  searchByName(ten: string) {
    return this.prisma.nguoiThue.findMany({
      where: { hoTen: { contains: ten }, isDelete: false },
    });
  }

  getAllLoadingBalance(id?: number) {
    return this.prisma.nguoiThue.findMany({
      where: { isDelete: false },
      orderBy: { idnt: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { idnt: id } }
        : {}),
    });
  }

}
