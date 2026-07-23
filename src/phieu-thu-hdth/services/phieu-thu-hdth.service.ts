import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhieuThuHdThDto } from '../dto/create-phieu-thu-hdth.dto';
import { UpdatePhieuThuHdThDto } from '../dto/update-phieu-thu-hdth.dto';
import { SearchPhieuThuHdThDto } from '../dto/search-phieu-thu-hdth.dto';
import { CreatePhieuThuTheoNguoiDto } from '../dto/create-phieu-thu-theo-nguoi.dto';
import { Prisma } from '@prisma/client';

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

  async createPhieuThuTheoNguoi(dto: CreatePhieuThuTheoNguoiDto) {
    const { idnt, soTien, ngayThu } = dto;


    // kiểm tra người có tồn tại không 
    const nguoiThue = await this.prisma.nguoiThue.findFirst({
      where: {
        idnt,
        isDelete: false,
      },
    });

    if (!nguoiThue) {
      throw new NotFoundException('Người thuê không tồn tại.');
    }

    if (!soTien || soTien <= 0) {
      throw new BadRequestException('Số tiền không hợp lệ');
    }


    const ngayThuDate = ngayThu ? new Date(ngayThu) : new Date();

    return this.prisma.$transaction(async (tx) => {
      const hoaDonList = await tx.hoaDonTapHoa.findMany({
        where: {
          idnt,
          isDelete: false,
        },
        include: {
          phieuThuHdTh: {
            where: {
              isDelete: false,
            },
          },
        },
        orderBy: {
          maHoaDon: 'asc',
        },
      });


      const hoaDonConNo = hoaDonList
        .map((hd) => {
          const daThu = hd.phieuThuHdTh.reduce(
            (sum, pt) => sum + Number(pt.soTien ?? 0),
            0,
          );

          return {
            ...hd,
            conNo: Number(hd.tongTien ?? 0) - daThu,
          };
        })
        .filter((hd) => hd.conNo > 0);

      if (hoaDonConNo.length === 0) {
        throw new BadRequestException(
          'Người thuê hiện không còn công nợ.',
        );
      }

      let soTienConLai = soTien;

      const phieuThuData: Prisma.PhieuThuHdThCreateManyInput[] = [];

      for (const hd of hoaDonConNo) {
        if (soTienConLai <= 0) break;

        const soTienCanThu = Math.min(soTienConLai, hd.conNo);

        phieuThuData.push({
          maHoaDon: hd.maHoaDon,
          ngayThu: ngayThuDate,
          soTien: soTienCanThu,
          
        });

        soTienConLai -= soTienCanThu;
      }

      if (soTienConLai > 0) {
        throw new BadRequestException(
          `Số tiền nhập (${soTien}) lớn hơn tổng công nợ hiện tại (${soTien - soTienConLai}).`,
        );
      }

      await tx.phieuThuHdTh.createMany({
        data: phieuThuData,
      });

      return {
        idnt,
        tongTienNhap: soTien,
        soHoaDonDuocThanhToan: phieuThuData.length,
        tongTienDaThu: soTien,
        chiTietThanhToan: phieuThuData,
      };
    });
  }

}
