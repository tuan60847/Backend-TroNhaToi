import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhongDto } from '../dto/create-phong.dto';
import { UpdatePhongDto } from '../dto/update-phong.dto';
import { ThongKeSnapshotService } from '../../thong-ke/services/thong-ke-snapshot.service';

@Injectable()
export class PhongService {
  constructor(
    private prisma: PrismaService,
    private thongKeSnapshotService: ThongKeSnapshotService,
  ) { }

  async findAll() {
    const dsPhong = await this.prisma.phong.findMany({
      where: { isDelete: false },
      include:
      {
        loaiPhong: true,
        HopDong: {
          where: { isDelete: false, trangThai: { not: 2 } },
        }
      },
    });
    return dsPhong.map((p) => {
      const phong = p as any;
      let giahientai = 0;
      const hdDangHieuLuc = phong.HopDong.filter((hd: any) => hd.trangThai === 1);
      if (hdDangHieuLuc && hdDangHieuLuc.length > 0) {
        giahientai = hdDangHieuLuc.reduce((sum, hd) => sum + Number(hd.giaPhongThucTe || 0), 0);
      } else {
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
    return this.prisma.$transaction(async (tx) => {
      const phong = await tx.phong.create({
        data: {
          tenPhong: dto.tenPhong,
          trangThai: dto.trangThai,
          moTa: dto.moTa,
          maLoaiPhong: dto.maLoaiPhong,
          isDelete: false,
        },
      });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return phong;
    });
  }

  async update(id: number, dto: UpdatePhongDto) {
    await this.findOne(id);
    const roomCurrent = await this.prisma.phong.findUnique({
      where: { phongId: id },
    });
    if (!roomCurrent) throw new NotFoundException(`Phong với id ${id} không tồn tại`);
    return this.prisma.$transaction(async (tx) => {
      const phong = await tx.phong.update({
        where: { phongId: id },
        data: {
          tenPhong: dto.tenPhong,
          trangThai: dto.trangThai,
          moTa: dto.moTa,
          maLoaiPhong: dto.maLoaiPhong,
        },
      });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return phong;
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

    const dsSuaChua = await this.prisma.suaChua.findMany({
      where: {
        thietBiId,
        isDelete: false,
      },
      include: { hoadonsuachua: true },
    });

    const thongKeTheoPhong = new Map<number, { dangSua: number; hong: number }>();

    for (const sc of dsSuaChua) {
      if (sc.phongId == null) continue;

      const hoaDon =
        sc.hoadonsuachua && !sc.hoadonsuachua.isDelete ? sc.hoadonsuachua : null;

      const current = thongKeTheoPhong.get(sc.phongId) ?? { dangSua: 0, hong: 0 };

      if (hoaDon?.trangThai === 3) {
        current.hong += 1;
      } else if (!hoaDon || hoaDon.trangThai === 0) {
        current.dangSua += 1;
      }
      // trangThai === 1 hoặc 2: không tính

      thongKeTheoPhong.set(sc.phongId, current);
    }

    const result = dsLapRap
      .filter((lr) => {
        if (lr.phongId == null) return false;

        const thongKe = thongKeTheoPhong.get(lr.phongId) ?? { dangSua: 0, hong: 0 };
        const soLuongLapRap = lr.soLuong ?? 0;

        return soLuongLapRap > thongKe.dangSua + thongKe.hong;
      })
      .map((lr) => {
        const phong = lr.phong as any;

        let giahientai = 0;
        if (phong.HopDong && phong.HopDong.length > 0) {
          giahientai = phong.HopDong.reduce(
            (sum: number, hd: any) => sum + (hd.giaPhongThucTe || 0),
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

    return result;
  }

  async remove(id: number) {
    await this.findOne(id);
    const hopDongConHieuLuc = await this.prisma.hopDong.findFirst({
      where: {
        phongId: id,
        isDelete: false,
        trangThai: { not: 2 },
      },
    });
    if (hopDongConHieuLuc) {
      throw new BadRequestException(
        'Không thể ẩn! Phòng đang có dữ liệu Hợp đồng liên kết (đang chờ hoặc đang hiệu lực). Vui lòng xử lý hợp đồng trước!'
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const phong = await tx.phong.update({
        where: { phongId: id },
        data: { isDelete: true },
      });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return phong;
    });
  }
}
