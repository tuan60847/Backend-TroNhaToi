import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhongDto } from '../dto/create-phong.dto';
import { UpdatePhongDto } from '../dto/update-phong.dto';

@Injectable()
export class PhongService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    const dsPhong = await this.prisma.phong.findMany({
      where: { isDelete: false },
      include:
      {
        loaiPhong: true,
        HopDong: {
          where: { isDelete: false, trangThai: 1 },
        }
      },
    });
    return dsPhong.map((p) => {
      const phong = p as any;
      let giahientai = 0;
      if (phong.HopDong && phong.HopDong.length > 0) {
        giahientai = phong.HopDong.reduce((sum, hd) => sum + Number(hd.giaPhongThucTe || 0), 0);
      }
      else {
        giahientai = phong.loaiPhong?.giaTien || 0;
      }
      return {
        ...phong,
        giahientai,
      }
    });
  }

  async getListNguoiThueByPhongId(phongId: number) {
    const phongWithHopDong = await this.prisma.phong.findFirst({
      where: {
        phongId: phongId,
        isDelete: false,
      },
      include: {
        HopDong: {
          where: { isDelete: false, trangThai: { not: 2 } },
          include: {
            nguoithue: true,
          }
        }
      }
    });
    if (!phongWithHopDong || !phongWithHopDong.HopDong) {
      return [];
    }
    const dsNguoiThue = phongWithHopDong.HopDong.map(hd => hd.nguoithue).filter(nt => nt !== null);
    return dsNguoiThue;
  }
  // Lấy thoong tin chi tiết phòng theo ID
  async findOne(id: number) {
    const item = await this.prisma.phong.findUnique({
      where: { phongId: id },
      include: { loaiPhong: true, HopDong: { where: { isDelete: false, trangThai: { not: 2 } } } },
    });
    if (!item) throw new NotFoundException(`Phong với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreatePhongDto) {
    return this.prisma.phong.create({
      data: {
        tenPhong: dto.tenPhong,
        trangThai: dto.trangThai,
        moTa: dto.moTa,
        maLoaiPhong: dto.maLoaiPhong,
        isDelete: false,
      }
    });
  }

  async update(id: number, dto: UpdatePhongDto) {
    await this.findOne(id);
    const roomCurrent = await this.prisma.phong.findUnique({
      where: { phongId: id },
    });
    if (!roomCurrent) throw new NotFoundException(`Phong với id ${id} không tồn tại`);
    return this.prisma.phong.update({
      where: { phongId: id },
      data: {
        tenPhong: dto.tenPhong,
        trangThai: dto.trangThai,
        moTa: dto.moTa,
        maLoaiPhong: dto.maLoaiPhong,
      },
    });
  }

  async getPhongByThietBiId(thietBiId: number) {
    const dsLapRap = await this.prisma.lapRap.findMany({
      where: {
        thietBiId,
        isDelete: false,
      },
      orderBy: {
        ngayLap: 'desc',
      },
      include: {
        phong: {
          include: {
            loaiPhong: true,
            HopDong: {
              where: {
                isDelete: false,
                trangThai: 1,
              },
            },
          },
        },
      },
    });

    if (dsLapRap.length === 0) {
      throw new NotFoundException(
        `Không tìm thấy phòng cho thiết bị với id ${thietBiId}`,
      );
    }

    return dsLapRap.map((lr) => {
      const phong = lr.phong as any;

      let giahientai = 0;

      if (phong.HopDong && phong.HopDong.length > 0) {
        giahientai = phong.HopDong.reduce(
          (sum, hd) => sum + (hd.giaPhongThucTe || 0),
          0,
        );
      } else {
        giahientai = phong.loaiPhong?.giaTien || 0;
      }

      return {
        ...phong,
        giahientai,
      };
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.phong.update({ where: { phongId: id }, data: { isDelete: true } });
  }
}
