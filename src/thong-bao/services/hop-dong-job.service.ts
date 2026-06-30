import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { ThongBaoService } from './thong-bao.service';

const CANH_BAO_NGAY = 30;

@Injectable()
export class HopDongJobService {
  private readonly logger = new Logger(HopDongJobService.name);

  constructor(
    private prisma: PrismaService,
    private thongBaoService: ThongBaoService,
  ) {}

  @Cron('0 8 * * *')
  async kiemTraHopDongSapHetHan() {
    this.logger.log('Bắt đầu kiểm tra hợp đồng sắp hết hạn...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mocCanhBao = new Date(today);
    mocCanhBao.setDate(mocCanhBao.getDate() + CANH_BAO_NGAY);

    const hopDongSapHet = await this.prisma.hopDong.findMany({
      where: {
        isDelete: false,
        ngayHetHan: {
          gte: today,
          lte: mocCanhBao,
        },
      },
      include: {
        phong: { select: { tenPhong: true } },
        nguoithue: { select: { hoTen: true, sdt: true } },
      },
    });

    if (hopDongSapHet.length === 0) {
      this.logger.log('Không có hợp đồng nào sắp hết hạn.');
      return;
    }

    const notifications: any[] = [];

    for (const hd of hopDongSapHet) {
      const soNgayCon = Math.ceil(
        (hd.ngayHetHan!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      const tenPhong = hd.phong?.tenPhong ?? '';
      const hoTen = hd.nguoithue?.hoTen ?? '';
      const sdt = hd.nguoithue?.sdt ?? '';
      const notification = await this.thongBaoService.upsertHopDongNotification(
        hd.hopDongId,
        soNgayCon,
        tenPhong,
        hoTen,
        sdt,
        hd.ngayHetHan!,
      );
      notifications.push({
        ...notification,
        hoTen,
        sdt,
        tenPhong,
        ngayHetHan: hd.ngayHetHan,
      });
    }

    this.logger.log(`Đã tạo/cập nhật ${notifications.length} thông báo.`);
    this.thongBaoService.emit(notifications);
  }

  async triggerManual() {
    return this.kiemTraHopDongSapHetHan();
  }
}
