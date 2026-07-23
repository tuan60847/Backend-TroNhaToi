import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNguoiLuuTruTamThoiDto } from '../dto/create-nguoi-luu-tru-tam-thoi.dto';
import { UpdateNguoiLuuTruTamThoiDto } from '../dto/update-nguoi-luu-tru-tam-thoi.dto';
import { SearchNguoiLuuTruTamThoiDto } from '../dto/search-nguoi-luu-tru-tam-thoi.dto';

@Injectable()
export class NguoiLuuTruTamThoiService {
  constructor(private prisma: PrismaService) {}

  async taoNguoiLuuTru(dto: CreateNguoiLuuTruTamThoiDto) {
    const nguoiThue = await this.prisma.nguoiThue.findFirst({
      where: { idnt: dto.IDNT, isDelete: false },
    });
    if (!nguoiThue) {
      throw new NotFoundException(`Người thuê bảo lãnh với ID ${dto.IDNT} không tồn tại`);
    }

    // Nếu có truyền phongId -> kiểm tra phòng có tồn tại không
    if (dto.phongId) {
      const phong = await this.prisma.phong.findFirst({
        where: { phongId: dto.phongId, isDelete: false },
      });
      if (!phong) {
        throw new NotFoundException(`Phòng với ID ${dto.phongId} không tồn tại`);
      }
    }

    return await this.prisma.nguoiLuuTruTamThoi.create({
      data: {
        IDNT: dto.IDNT,
        phongId: dto.phongId,
        hoTen: dto.hoTen,
        moiQuanHe: dto.moiQuanHe,
        cccd: dto.cccd,
        sdt: dto.sdt,
        ngayDen: dto.ngayDen ? new Date(dto.ngayDen) : new Date(),
        ngayVe: dto.ngayVe ? new Date(dto.ngayVe) : null,
      },
      include: {
        phong: true,
        nguoithue: true,
      },
    });
  }

  async getDanhSachLuuTru(idnt?: number) {
    const whereCondition: any = { isDelete: false };

    if (idnt) whereCondition.IDNT = idnt;

    return await this.prisma.nguoiLuuTruTamThoi.findMany({
      where: whereCondition,
      include: {
        phong: {
          select: {
            phongId: true,
            tenPhong: true,
          },
        },
        nguoithue: {
          select: {
            idnt: true,
            hoTen: true,
            sdt: true,
          },
        },
      },
      orderBy: {
        idtt: 'desc',
      },
    });
  }


  async getChiTietLuuTru(idtt: number) {
    const item = await this.prisma.nguoiLuuTruTamThoi.findFirst({
      where: { idtt, isDelete: false },
      include: {
        phong: true,
        nguoithue: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Không tìm thấy thông tin lưu trú ID ${idtt}`);
    }

    return item;
  }

  async capNhatLuuTru(idtt: number, dto: UpdateNguoiLuuTruTamThoiDto) {
    await this.getChiTietLuuTru(idtt); // Kiểm tra tồn tại

    return await this.prisma.nguoiLuuTruTamThoi.update({
      where: { idtt },
      data: {
        ...(dto.hoTen !== undefined && { hoTen: dto.hoTen }),
        ...(dto.moiQuanHe !== undefined && { moiQuanHe: dto.moiQuanHe }),
        ...(dto.cccd !== undefined && { cccd: dto.cccd }),
        ...(dto.sdt !== undefined && { sdt: dto.sdt }),
        ...(dto.phongId !== undefined && { phongId: dto.phongId }),
        ...(dto.IDNT !== undefined && { IDNT: dto.IDNT }),
        ...(dto.ngayDen && { ngayDen: new Date(dto.ngayDen) }),
        ...(dto.ngayVe && { ngayVe: new Date(dto.ngayVe) }),
      },
      include: {
        phong: true,
        nguoithue: true,
      },
    });
  }

  async xoaLuuTru(idtt: number) {
    await this.getChiTietLuuTru(idtt); // Kiểm tra tồn tại

    return await this.prisma.nguoiLuuTruTamThoi.update({
      where: { idtt },
      data: { isDelete: true },
    });
  }

}
