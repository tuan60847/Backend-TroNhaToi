import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ThongKeQueryDto } from '../dto/thong-ke-query.dto';

@Injectable()
export class ThongKeService {

    constructor(
        private readonly prisma: PrismaService,
    ) { }

    /**
     * ==========================================
     * HÀM HỖ TRỢ
     * ==========================================
     */

    /**
     * ==========================================
     * DECIMAL -> NUMBER
     * ==========================================
     */
    private toNumber(
        value: Prisma.Decimal | number | null | undefined,
    ): number {

        if (value === null || value === undefined) {
            return 0;
        }

        return Number(value);
    }

    /**
     * ==========================================
     * THÁNG/NĂM
     * VD:
     * 07/2026
     * ==========================================
     */
    private getThangNam(
        dto: ThongKeQueryDto,
    ): string | null {

        if (!dto.thang) {
            return null;
        }

        return `${String(dto.thang).padStart(2, '0')}/${dto.nam}`;
    }

    /**
     * ==========================================
     * KHOẢNG NGÀY
     * ==========================================
     */
    private getDateRange(
        dto: ThongKeQueryDto,
    ) {

        const from = new Date(
            dto.nam,
            dto.thang ? dto.thang - 1 : 0,
            1,
        );

        const to = dto.thang
            ? new Date(
                dto.nam,
                dto.thang,
                0,
                23,
                59,
                59,
                999,
            )
            : new Date(
                dto.nam,
                11,
                31,
                23,
                59,
                59,
                999,
            );

        return {
            from,
            to,
        };
    }

    /**
     * ==========================================
     * TỔNG QUAN
     * ==========================================
     */

    /**
 * ==========================================
 * TỔNG DOANH THU
 * ==========================================
 */
    private async getTongDoanhThu(
        dto: ThongKeQueryDto,
    ) {

        const thangNam = this.getThangNam(dto);

        const { from, to } = this.getDateRange(dto);

        const [
            hoaDonPhong,
            hoaDonGuiXe,
            hoaDonTapHoa,
        ] = await Promise.all([

            this.prisma.hoaDonPhong.aggregate({
                _sum: {
                    soTien: true,
                },
                where: {
                    isDelete: false,
                    ...(thangNam
                        ? {
                            thangNam,
                        }
                        : {
                            thangNam: {
                                endsWith: `${dto.nam}`,
                            },
                        }),
                },
            }),

            this.prisma.hoaDonGuiXe.aggregate({
                _sum: {
                    soTien: true,
                },
                where: {
                    isDelete: false,
                    ...(thangNam
                        ? {
                            thangNam,
                        }
                        : {
                            thangNam: {
                                endsWith: `${dto.nam}`,
                            },
                        }),
                },
            }),

            this.prisma.hoaDonTapHoa.aggregate({
                _sum: {
                    tongTien: true,
                },
                where: {
                    isDelete: false,
                    ngayBan: {
                        gte: from,
                        lte: to,
                    },
                },
            }),

        ]);

        const doanhThuPhong =
            this.toNumber(
                hoaDonPhong._sum.soTien,
            );

        const doanhThuGuiXe =
            this.toNumber(
                hoaDonGuiXe._sum.soTien,
            );

        const doanhThuTapHoa =
            this.toNumber(
                hoaDonTapHoa._sum.tongTien,
            );

        return {
            doanhThuPhong,
            doanhThuGuiXe,
            doanhThuTapHoa,
            tongDoanhThu:
                doanhThuPhong +
                doanhThuGuiXe +
                doanhThuTapHoa,
        };
    }

    /**
     * ==========================================
     * TỔNG ĐÃ THU
     * ==========================================
     */
    private async getTongDaThu(
        dto: ThongKeQueryDto,
    ) {

        const { from, to } =
            this.getDateRange(dto);

        const [
            thuPhong,
            thuTapHoa,
        ] = await Promise.all([

            this.prisma.phieuThuHangThang.aggregate({
                _sum: {
                    soTien: true,
                },
                where: {
                    isDelete: false,
                    ngayThu: {
                        gte: from,
                        lte: to,
                    },
                },
            }),

            this.prisma.phieuThuHdTh.aggregate({
                _sum: {
                    soTien: true,
                },
                where: {
                    isDelete: false,
                    ngayThu: {
                        gte: from,
                        lte: to,
                    },
                },
            }),

        ]);

        const daThuPhong =
            this.toNumber(
                thuPhong._sum.soTien,
            );

        const daThuTapHoa =
            this.toNumber(
                thuTapHoa._sum.soTien,
            );

        return {
            daThuPhong,
            daThuTapHoa,
            tongDaThu:
                daThuPhong +
                daThuTapHoa,
        };
    }

    /**
     * ==========================================
     * TỔNG CÔNG NỢ
     * ==========================================
     */
    private async getTongCongNo(
        dto: ThongKeQueryDto,
    ) {

        const [
            doanhThu,
            daThu,
        ] = await Promise.all([

            this.getTongDoanhThu(dto),

            this.getTongDaThu(dto),

        ]);

        return {
            tongCongNo:
                doanhThu.tongDoanhThu -
                daThu.tongDaThu,
        };
    }

    /**
     * ==========================================
     * TỔNG CHI PHÍ
     * ==========================================
     */
    private async getTongChiPhi(
        dto: ThongKeQueryDto,
    ) {

        const { from, to } =
            this.getDateRange(dto);

        const hoaDonSuaChua =
            await this.prisma.hoaDonSuaChua.aggregate({

                _sum: {
                    giaTien: true,
                },

                where: {
                    isDelete: false,
                    ngayLapHoaDonSc: {
                        gte: from,
                        lte: to,
                    },
                },

            });

        return {
            tongChiPhi:
                this.toNumber(
                    hoaDonSuaChua._sum.giaTien,
                ),
        };
    }

    /**
     * ==========================================
     * THỐNG KÊ
     * ==========================================
     */

    /**
 * ==========================================
 * THỐNG KÊ PHÒNG
 * ==========================================
 */
    private async getThongKePhong() {

        const [
            tongPhong,
            hopDongConHan,
        ] = await Promise.all([

            this.prisma.phong.count({
                where: {
                    isDelete: false,
                },
            }),

            this.prisma.hopDong.findMany({
                where: {
                    isDelete: false,
                    trangThai: 1,
                    ngayHetHan: {
                        gte: new Date(),
                    },
                },
                select: {
                    phongId: true,
                },
                distinct: ['phongId'],
            }),

        ]);

        const phongDangThue =
            hopDongConHan.length;

        const phongTrong =
            tongPhong - phongDangThue;

        const tiLeLapDay =
            tongPhong === 0
                ? 0
                : Number(
                    (
                        (phongDangThue / tongPhong) *
                        100
                    ).toFixed(2),
                );

        return {
            tongPhong,
            phongDangThue,
            phongTrong,
            tiLeLapDay,
        };
    }

    /**
     * ==========================================
     * THỐNG KÊ NGƯỜI THUÊ
     * ==========================================
     */
    private async getThongKeNguoiThue() {

        const [
            tongNguoiThue,
            nguoiDangThue,
            nguoiDaDonDi,
            hopDongSapHet,
        ] = await Promise.all([

            this.prisma.nguoiThue.count({
                where: {
                    isDelete: false,
                },
            }),

            this.prisma.nguoiThue.count({
                where: {
                    isDelete: false,
                    trangThai: 1,
                },
            }),

            this.prisma.nguoiThue.count({
                where: {
                    isDelete: false,
                    trangThai: 2,
                },
            }),

            this.prisma.hopDong.count({
                where: {
                    isDelete: false,
                    trangThai: 1,
                    ngayHetHan: {
                        gte: new Date(),
                        lte: new Date(
                            new Date().setDate(
                                new Date().getDate() + 30,
                            ),
                        ),
                    },
                },
            }),

        ]);

        return {
            tongNguoiThue,
            nguoiDangThue,
            nguoiDaDonDi,
            hopDongSapHet,
        };
    }

    /**
     * ==========================================
     * THỐNG KÊ THIẾT BỊ
     * ==========================================
     */
    private async getThongKeThietBi() {

        const [
            tongThietBi,
            thietBiHoatDong,
            thietBiDangSua,
            thietBiHong,
            tongLapRap,
            tongSuaChua,
        ] = await Promise.all([

            this.prisma.thietBi.count({
                where: {
                    isDelete: false,
                },
            }),

            this.prisma.thietBi.count({
                where: {
                    isDelete: false,
                    trangThai: 0,
                },
            }),

            this.prisma.thietBi.count({
                where: {
                    isDelete: false,
                    trangThai: 1,
                },
            }),

            this.prisma.thietBi.count({
                where: {
                    isDelete: false,
                    trangThai: 2,
                },
            }),

            this.prisma.lapRap.count({
                where: {
                    isDelete: false,
                },
            }),

            this.prisma.suaChua.count({
                where: {
                    isDelete: false,
                },
            }),

        ]);

        return {
            tongThietBi,
            thietBiHoatDong,
            thietBiDangSua,
            thietBiHong,
            tongLapRap,
            tongSuaChua,
        };
    }

    /**
     * ==========================================
     * BIỂU ĐỒ
     * ==========================================
     */

    /**
 * ==========================================
 * CHART DOANH THU 12 THÁNG
 * ==========================================
 */
    private async getChartDoanhThu(
        nam: number,
    ) {

        const chart = [];

        for (let thang = 1; thang <= 12; thang++) {

            const thangNam =
                `${String(thang).padStart(2, '0')}/${nam}`;

            const from = new Date(
                nam,
                thang - 1,
                1,
            );

            const to = new Date(
                nam,
                thang,
                0,
                23,
                59,
                59,
                999,
            );

            const [
                hoaDonPhong,
                hoaDonGuiXe,
                hoaDonTapHoa,
            ] = await Promise.all([

                this.prisma.hoaDonPhong.aggregate({
                    _sum: {
                        soTien: true,
                    },
                    where: {
                        isDelete: false,
                        thangNam,
                    },
                }),

                this.prisma.hoaDonGuiXe.aggregate({
                    _sum: {
                        soTien: true,
                    },
                    where: {
                        isDelete: false,
                        thangNam,
                    },
                }),

                this.prisma.hoaDonTapHoa.aggregate({
                    _sum: {
                        tongTien: true,
                    },
                    where: {
                        isDelete: false,
                        ngayBan: {
                            gte: from,
                            lte: to,
                        },
                    },
                }),

            ]);

            const doanhThu =
                this.toNumber(hoaDonPhong._sum.soTien) +
                this.toNumber(hoaDonGuiXe._sum.soTien) +
                this.toNumber(hoaDonTapHoa._sum.tongTien);

            chart.push({
                thang,
                doanhThu,
            });

        }

        return chart;
    }

    /**
     * ==========================================
     * TOP
     * ==========================================
     */

    // private getTopPhong(dto)

    // private getTopCongNo(dto)

    // private getTopHangHoa(dto)

    // private getTopThietBiSua(dto)

    /**
     * ==========================================
     * HỢP ĐỒNG
     * ==========================================
     */

    /**
 * ==========================================
 * HỢP ĐỒNG SẮP HẾT HẠN
 * (Trong 30 ngày tới)
 * ==========================================
 */
    private async getHopDongSapHet() {

        const today = new Date();

        const after30Days = new Date();

        after30Days.setDate(
            after30Days.getDate() + 30,
        );

        const hopDongSapHet =
            await this.prisma.hopDong.findMany({

                where: {
                    isDelete: false,
                    trangThai: 1,
                    ngayHetHan: {
                        gte: today,
                        lte: after30Days,
                    },
                },

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
                    ngayHetHan: 'asc',
                },

                take: 5,

            });

        return hopDongSapHet;
    }

    /**
     * ==========================================
     * API
     * ==========================================
     */

    async getThongKe(dto: ThongKeQueryDto) {

        const [
            doanhThu,
            daThu,
            congNo,
            chiPhi,
            phong,
            nguoiThue,
            thietBi,
            chart,
            // topPhong,
            // topCongNo,
            // topHangHoa,
            // topThietBiSua,
            hopDongSapHet,
        ] = await Promise.all([

            this.getTongDoanhThu(dto),

            this.getTongDaThu(dto),

            this.getTongCongNo(dto),

            this.getTongChiPhi(dto),

            this.getThongKePhong(),

            this.getThongKeNguoiThue(),

            this.getThongKeThietBi(),

            this.getChartDoanhThu(dto.nam),

            // this.getTopPhong(),

            // this.getTopCongNo(),

            // this.getTopHangHoa(),

            // this.getTopThietBiSua(),

            this.getHopDongSapHet(),

        ]);

        return {
            doanhThu,
            daThu,
            congNo,
            chiPhi,
            phong,
            nguoiThue,
            thietBi,
            chart,
            // topPhong,
            // topCongNo,
            // topHangHoa,
            // topThietBiSua,
            hopDongSapHet,
        };
    }
}