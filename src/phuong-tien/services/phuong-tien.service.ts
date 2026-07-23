import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhuongTienDto } from '../dto/create-phuong-tien.dto';
import { UpdatePhuongTienDto } from '../dto/update-phuong-tien.dto';
import { SearchPhuongTienDto } from '../dto/search-phuong-tien.dto';

@Injectable()
export class PhuongTienService {
  constructor(private prisma: PrismaService) {}
  //lấy ds phuong tiện theo người thuê
  async findByNguoiThue(idnt: number) {
    return this.prisma.phuongTien.findMany({
      where: {
        idnt: idnt,
        isDelete: false, // Chỉ lấy các xe đang hoạt động
      },
      include: {
        phong: {
          select: {
            phongId: true,
            tenPhong: true,
          },
        },
      },
      orderBy: {
        ID: 'desc', // Xe mới thêm xếp lên đầu
      },
    });
  }

 async findOne(id: number) {
    const item = await this.prisma.phuongTien.findFirst({
      where: { ID: id, isDelete: false },
      include: {
        phong: {
          select: {
            phongId: true,
            tenPhong: true,
          },
        },
      },
    });
    if (!item) throw new NotFoundException(`Phương tiện với ID ${id} không tồn tại`);
    return item;
  }

  async create(createDto: CreatePhuongTienDto) {
    return this.prisma.phuongTien.create({  
      data: {
        bienSo: createDto.bienSo || 'Không BKS',
        hangXe: createDto.hangXe,
        mauSac: createDto.mauSac,
        idnt: createDto.idnt,
        phongId: createDto.phongId ?? null,
        loaixe: createDto.loaixe ?? 0,
        SoTien: createDto.SoTien ?? 0,
      },
      include: {
        phong: {
          select: {
            phongId: true,
            tenPhong: true,
          },
        },
      },
    });
  }

  async update(id: number, updateDto: UpdatePhuongTienDto) {
    await this.findOne(id); // Kiểm tra tồn tại trước khi update

    return this.prisma.phuongTien.update({
      where: { ID: id }, 
      data: {
        ...(updateDto.bienSo !== undefined && { bienSo: updateDto.bienSo || 'Không BKS' }),
        ...(updateDto.hangXe !== undefined && { hangXe: updateDto.hangXe }),
        ...(updateDto.mauSac !== undefined && { mauSac: updateDto.mauSac }),
        ...(updateDto.idnt !== undefined && { idnt: updateDto.idnt }),
        ...(updateDto.phongId !== undefined && { phongId: updateDto.phongId }),
        ...(updateDto.loaixe !== undefined && { loaixe: updateDto.loaixe }),
        ...(updateDto.SoTien !== undefined && { SoTien: updateDto.SoTien }),
      },
      include: {
        phong: {
          select: {
            phongId: true,
            tenPhong: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Kiểm tra tồn tại trước khi xóa

    return this.prisma.phuongTien.update({
      where: { ID: id },
      data: { isDelete: true },
      include: {
        phong: {
          select: {
            phongId: true,
            tenPhong: true,
          },
        },
      },
    });
  }
  //-------
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
