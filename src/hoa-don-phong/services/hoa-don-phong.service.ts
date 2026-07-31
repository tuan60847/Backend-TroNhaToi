import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHoaDonPhongDto } from '../dto/create-hoa-don-phong.dto';
import { ThongKeSnapshotService } from '../../thong-ke/services/thong-ke-snapshot.service';

@Injectable()
export class HoaDonPhongService {
  constructor(
    private prisma: PrismaService,
    private thongKeSnapshot: ThongKeSnapshotService,
  ) { }

  // Laays tát cả ds hóa đơn theo kỳ
  async getAllDanhSachQuanLyHoaDon(thangNam?: string) {
    //Lấy tất cả các phòng đang hoạt động 
    const danhSachPhong = await this.prisma.phong.findMany({
      where: { isDelete: false },
      select: { phongId: true, tenPhong: true },
    });

    let danhSachTatCaHoaDon: any[] = [];

    //Duyệt qua từng phòng
    for (const phong of danhSachPhong) {
      const danhSachHoaDonCuaPhong = await this.getDanhSachByPhong(phong.phongId, thangNam);

      // Đảm bảo mỗi item hóa đơn đều có thông tin tên phòng chuẩn xác
      const danhSachHoaDonMap = danhSachHoaDonCuaPhong.map(hoaDon => ({
        ...hoaDon,
        tenPhong: phong.tenPhong,
      }));

      danhSachTatCaHoaDon.push(...danhSachHoaDonMap);
    }

    //Sắp xếp theo ngày lập mới nhất lên đầu
    danhSachTatCaHoaDon.sort((a, b) => {
      const thoiGianA = a.ngayLap ? new Date(a.ngayLap).getTime() : 0;
      const thoiGianB = b.ngayLap ? new Date(b.ngayLap).getTime() : 0;
      return thoiGianB - thoiGianA;
    });

    return {
      success: true,
      data: danhSachTatCaHoaDon,
    };
  }

  async getHoaDonInitData(phongId: number, thangNam: string) {
    const thongTinPhong = await this.prisma.phong.findUnique({
      where: { phongId: phongId, isDelete: false },
      include: { loaiPhong: true },
    });

    if (!thongTinPhong) {
      throw new NotFoundException(`Không tìm thấy phòng với ID ${phongId}`);
    }

    const banGhiCuoiCungCuaThang = await this.prisma.dienNuoc.findFirst({
      where: { phongId: phongId, thangNam: thangNam },
      orderBy: { lanGhi: 'desc' },
    });

    const cauHinhGia = await this.prisma.cauHinhGia.findFirst({
      orderBy: { id: 'desc' },
    });
    
    const giaDienHeThong = cauHinhGia?.giaDien ?? 3500;
    const giaNuocHeThong = cauHinhGia?.giaNuoc ?? 15000;

    const giaDien = banGhiCuoiCungCuaThang?.giaDienApDung ?? giaDienHeThong;
    const giaNuoc = banGhiCuoiCungCuaThang?.giaNuocApDung ?? giaNuocHeThong;

    const banGhiChuaChot = await this.prisma.dienNuoc.findFirst({
      where: { phongId: phongId, thangNam: thangNam, TrangThai: 0 },
      orderBy: { lanGhi: 'desc' },
    });

    let dienNuocData: any = null;

    if (banGhiChuaChot) {
      dienNuocData = {
        mode: 'EXISTS',
        lanGhi: banGhiChuaChot.lanGhi,
        chiSoDienCu: banGhiChuaChot.chiSoDienCu,
        chiSoDienMoi: banGhiChuaChot.chiSoDienMoi,
        chiSoNuocCu: banGhiChuaChot.chiSoNuocCu,
        chiSoNuocMoi: banGhiChuaChot.chiSoNuocMoi,
        anhDienMoi: banGhiChuaChot.anhDienMoi,
        anhNuocMoi: banGhiChuaChot.anhNuocMoi,
      };
    } else {
      const banGhiDaChotMoiNhat = await this.prisma.dienNuoc.findFirst({
        where: { phongId: phongId, TrangThai: 1 },
        orderBy: [{ ngayGhi: 'desc' }, { lanGhi: 'desc' }],
      });

      let chiSoDienCu = banGhiDaChotMoiNhat?.chiSoDienMoi ?? 0;
      let chiSoNuocCu = banGhiDaChotMoiNhat?.chiSoNuocMoi ?? 0;

      dienNuocData = {
        mode: 'NEED_NEW',
        chiSoDienCu: chiSoDienCu,
        chiSoDienMoi: 0,
        chiSoNuocCu: chiSoNuocCu,
        chiSoNuocMoi: 0,
        anhDienMoi: null,
        anhNuocMoi: null,
      };
    }
    //Kiểm tra xem tháng này đã có bản ghi điện nước nào đã chốt (TrangThai: 1) nhưng CHƯA ĐƯỢC THANH TOÁN hay chưa
    const danhSachDienNuocDaChot = await this.prisma.dienNuoc.findMany({
      where: { phongId: phongId, thangNam: thangNam, TrangThai: 1 },
      include: { phieuThuDienNuoc: { where: { isDelete: false } } },
    });

    let canCreateDienNuoc = true; // Mặc định cho phép tạo
    for (const dn of danhSachDienNuocDaChot) {
      const tienDien = (dn.chiSoDienMoi - dn.chiSoDienCu) * giaDien;
      const tienNuoc = (dn.chiSoNuocMoi - dn.chiSoNuocCu) * giaNuoc;
      const tongTienDN = tienDien + tienNuoc;
      const daThuDN = Number(dn.phieuThuDienNuoc?.soTien ?? 0);

      // Nếu có bất kỳ bản ghi điện nước nào đã chốt mà chưa thanh toán đủ -> Khóa không cho tạo mới
      if (daThuDN < tongTienDN && tongTienDN > 0) {
        canCreateDienNuoc = false;
        break;
      }
    }

    const [phanThang, phanNam] = thangNam.split('/');
    const thangInt = parseInt(phanThang, 10);
    const namInt = parseInt(phanNam, 10);

    const ngayDauThang = new Date(namInt, thangInt - 1, 1);
    const ngayCuoiThang = new Date(namInt, thangInt, 0, 23, 59, 59);
    const soNgayTrongThang = ngayCuoiThang.getDate();
    const activeContracts = await this.prisma.hopDong.findMany({
      where: {
        phongId: phongId,
        isDelete: false,
        ngayKy: { lte: ngayCuoiThang },
        OR: [
          { trangThai: 1 },
          { trangThai: 0 },
        ], //quét những ai đang có hợp đồng hiệu lực or sắp hiệu lực mà vẫn đang nằm trong tháng đó
      },
      select: { idnt: true },
    });

    const dsNt = Array.from(new Set(activeContracts.map((c) => c.idnt)));

    // Nếu phòng không có ai đang ở, trả về danh sách hóa đơn phòng trống luôn
    if (dsNt.length === 0) {
      return {
        phongId,
        tenPhong: thongTinPhong.tenPhong,
        thangNam,
        giaDien,
        giaNuoc,
        dienNuoc: dienNuocData,
        canCreateDienNuoc,
        danhSachHopDong: [],
        tienDichVuKhacDefault: 0,
      };
    }

    const danhSachHopDong = await this.prisma.hopDong.findMany({
      where: {
        phongId: phongId,
        isDelete: false,
        idnt: { in: dsNt }, // Chỉ lấy của người đang ở
        ngayKy: { lte: ngayCuoiThang },
        OR: [
          { trangThai: 1 },
          { trangThai: 0 },
          { trangThai: 2, ngayHetHan: { gte: ngayDauThang } },
        ],
      },
      include: {
        nguoithue: true,
        hoaDonPhong: {
          where: { thangNam: thangNam, isDelete: false },
        },
      },
      orderBy: { ngayKy: 'asc' },
    });

    const danhSachPhuongTien = await this.prisma.phuongTien.findMany({
      where: { phongId: phongId, isDelete: false },
      include: { nguoithue: true },
    });

    const tenantContractsMap = new Map<number, typeof danhSachHopDong>();
    for (const hd of danhSachHopDong) {
      if (!tenantContractsMap.has(hd.idnt)) {
        tenantContractsMap.set(hd.idnt, []);
      }
      tenantContractsMap.get(hd.idnt)!.push(hd);
    }

    const danhSachHopDongCalculated: any[] = [];

    for (const [idnt, contracts] of tenantContractsMap.entries()) {
      contracts.sort((a, b) => {
        const dA = a.ngayKy ? new Date(a.ngayKy).getTime() : 0;
        const dB = b.ngayKy ? new Date(b.ngayKy).getTime() : 0;
        return dA - dB;
      });

      let totalTenantRent = 0;
      const noteLines: string[] = [];

      let targetHopDong =
        contracts.find((c) => c.trangThai === 1 || c.trangThai === 0) ??
        contracts[contracts.length - 1];

      let isAlreadyBilled = false;
      let existingInvoice: any = null;

      for (let i = 0; i < contracts.length; i++) {
        const hd = contracts[i];
        const nextHd = i + 1 < contracts.length ? contracts[i + 1] : null;

        const matchedInvoice = contracts[i].hoaDonPhong?.find(
          (inv) => inv.thangNam === thangNam && !inv.isDelete,
        );

        let segmentAmount = 0;

        if (matchedInvoice) {
          isAlreadyBilled = true;
          existingInvoice = matchedInvoice;

          try {
            const parsedSnap = JSON.parse(matchedInvoice.chiTietJson as string);
            segmentAmount = Number(
              parsedSnap.tongTienPhong ??
              parsedSnap.danhSachKhachThue?.[0]?.calculatedAmount ??
              0,
            );
          } catch (_) {
            segmentAmount = Number(matchedInvoice.soTien ?? 0);
          }
          noteLines.push(`Đã lập hóa đơn cho kỳ ${thangNam}`);
        } else {
          const giaPhongGoc = Number(
            hd.giaPhongThucTe ?? thongTinPhong.loaiPhong?.giaTien ?? 0,
          );

          const dKy = hd.ngayKy ? new Date(hd.ngayKy) : ngayDauThang;
          const dHetHan = hd.ngayHetHan ? new Date(hd.ngayHetHan) : null;

          let startDay = 1;
          if (dKy.getFullYear() === namInt && dKy.getMonth() + 1 === thangInt) {
            startDay = dKy.getDate();
          }

          let endDay = soNgayTrongThang;

          if (nextHd) {
            const dNextKy = nextHd.ngayKy ? new Date(nextHd.ngayKy) : null;
            if (
              dNextKy &&
              dNextKy.getFullYear() === namInt &&
              dNextKy.getMonth() + 1 === thangInt
            ) {
              endDay = dNextKy.getDate() - 1;
            }
          } else if (hd.trangThai === 2 && dHetHan) {
            if (
              dHetHan.getFullYear() === namInt &&
              dHetHan.getMonth() + 1 === thangInt
            ) {
              endDay = dHetHan.getDate();
            }
          }

          if (endDay >= startDay) {
            const soNgayO = endDay - startDay + 1;

            if (
              startDay === 1 &&
              endDay === soNgayTrongThang &&
              contracts.length === 1
            ) {
              segmentAmount = giaPhongGoc;
              noteLines.push(
                `Ở trọn tháng ${thangNam} (${giaPhongGoc.toLocaleString('vi-VN')}đ)`,
              );
            } else {
              segmentAmount = Math.round(
                (soNgayO / soNgayTrongThang) * giaPhongGoc,
              );
              noteLines.push(
                `Từ ${startDay}/${thangInt} - ${endDay}/${thangInt} (${hd.hopDongId}): ${soNgayO} ngày x ${giaPhongGoc.toLocaleString('vi-VN')}đ/${soNgayTrongThang}`,
              );
            }
          }
        }
        totalTenantRent += segmentAmount;
      }

      const listXe = danhSachPhuongTien
        .filter((xe) => xe.idnt === idnt)
        .map((xe) => ({
          id: xe.ID,
          bienSo: xe.bienSo,
          hangXe: xe.hangXe ?? 'Xe máy',
          chuXe: targetHopDong.nguoithue?.hoTen ?? 'Khách thuê',
          price: Number(xe.SoTien ?? 0),
        }));

      const tongTienXe = listXe.reduce((sum, x) => sum + x.price, 0);

      danhSachHopDongCalculated.push({
        hopDongId: targetHopDong.hopDongId,
        idnt: idnt,
        hoTen: targetHopDong.nguoithue?.hoTen ?? 'Khách thuê',
        sdt: targetHopDong.nguoithue?.sdt ?? '',
        giaPhongGoc: Number(
          targetHopDong.giaPhongThucTe ?? thongTinPhong.loaiPhong?.giaTien ?? 0,
        ),
        soNgayO: soNgayTrongThang,
        soNgayTrongThang,
        calculatedTienPhong: totalTenantRent,
        noteFormula: noteLines.join('\n'),
        danhSachXe: listXe,
        tongTienXe,
        isAlreadyBilled,
        existingInvoice: existingInvoice
          ? {
            maHoaDon: existingInvoice.maHoaDon,
            soTien: Number(existingInvoice.soTien ?? 0),
            ngayLap: existingInvoice.ngayLap,
            trangThai: existingInvoice.trangThai,
            chiTietJson: existingInvoice.chiTietJson,
          }
          : null,
      });
    }

    return {
      phongId,
      tenPhong: thongTinPhong.tenPhong,
      thangNam,
      giaDien,
      giaNuoc,
      dienNuoc: dienNuocData,
      canCreateDienNuoc,
      danhSachHopDong: danhSachHopDongCalculated,
      tienDichVuKhacDefault: 0,
    };
  }

  async createHoaDonPhong(
    dto: CreateHoaDonPhongDto,
    danhSachUrlAnh: { anhDienMoi?: string; anhNuocMoi?: string },
  ) {
    const { phongId, thangNam, isChotDienNuoc, danhSachHopDongJson } = dto;

    //CHẶN TẠO ĐIỆN NƯỚC NẾU CÒN HÓA ĐƠN CŨ CHƯA THANH TOÁN
    if (isChotDienNuoc) {
      const danhSachDienNuocCu = await this.prisma.dienNuoc.findMany({
        where: { phongId: Number(phongId), thangNam: thangNam, TrangThai: 1 },
        include: { phieuThuDienNuoc: { where: { isDelete: false } } },
      });

      const cauHinhGia = await this.prisma.cauHinhGia.findFirst({
        orderBy: { id: 'desc' },
      });
      const giaDien = cauHinhGia?.giaDien ?? 3500;
      const giaNuoc = cauHinhGia?.giaNuoc ?? 15000;

      for (const dn of danhSachDienNuocCu) {
        const tienD = (dn.chiSoDienMoi - dn.chiSoDienCu) * giaDien;
        const tienN = (dn.chiSoNuocMoi - dn.chiSoNuocCu) * giaNuoc;
        const tongDN = tienD + tienN;
        const daThuDN = Number(dn.phieuThuDienNuoc?.soTien ?? 0);

        if (daThuDN < tongDN && tongDN > 0) {
          throw new BadRequestException(
            `Hóa đơn điện nước lần ${dn.lanGhi} của tháng ${thangNam} chưa được thanh toán đủ, không thể tạo thêm bản ghi điện nước mới!`,
          );
        }
      }
    }

    if (isChotDienNuoc && dto.chiSoDienMoi !== undefined && dto.chiSoDienCu !== undefined) {
      if (dto.chiSoDienMoi < dto.chiSoDienCu) {
        throw new BadRequestException('Chỉ số điện mới không được nhỏ hơn chỉ số điện cũ!');
      }
    }
    if (isChotDienNuoc && dto.chiSoNuocMoi !== undefined && dto.chiSoNuocCu !== undefined) {
      if (dto.chiSoNuocMoi < dto.chiSoNuocCu) {
        throw new BadRequestException('Chỉ số nước mới không được nhỏ hơn chỉ số nước cũ!');
      }
    }

    let customContractsMap = new Map<string, any>();
    if (danhSachHopDongJson) {
      try {
        let parsedList: any = danhSachHopDongJson;
        if (typeof parsedList === 'string') {
          try {
            parsedList = JSON.parse(parsedList);
          } catch (_) { }
        }
        if (typeof parsedList === 'string') {
          try {
            parsedList = JSON.parse(parsedList);
          } catch (_) { }
        }

        if (Array.isArray(parsedList)) {
          for (const item of parsedList) {
            if (item.hopDongId !== undefined && item.hopDongId !== null) {
              customContractsMap.set(String(item.hopDongId).trim(), item);
            }
            if (item.idnt !== undefined && item.idnt !== null) {
              customContractsMap.set(String(item.idnt).trim(), item);
            }
          }
        }
      } catch (e) {
        console.error('Lỗi parse danhSachHopDongJson:', e);
      }
    }

    return await this.prisma.$transaction(async (tx) => {
      const previewData = await this.getHoaDonInitData(phongId, thangNam);
      const dsHopDong = previewData.danhSachHopDong;

      const createdInvoices: any[] = [];
      const cleanThangNam = thangNam.replace('/', '');

      if (isChotDienNuoc && dto.chiSoDienMoi !== undefined && dto.chiSoNuocMoi !== undefined) {
        const cuDien = dto.chiSoDienCu ?? 0;
        const moiDien = dto.chiSoDienMoi ?? 0;
        const cuNuoc = dto.chiSoNuocCu ?? 0;
        const moiNuoc = dto.chiSoNuocMoi ?? 0;

        const banGhiChuaChot = await tx.dienNuoc.findFirst({
          where: { phongId: phongId, thangNam: thangNam, TrangThai: 0 },
          orderBy: { lanGhi: 'desc' },
        });
        const cauHinhGiaHienTai = await tx.cauHinhGia.findFirst({
          orderBy: { id: 'desc' },
        });
        const giaDienSystem = cauHinhGiaHienTai?.giaDien ?? 3500;
        const giaNuocSystem = cauHinhGiaHienTai?.giaNuoc ?? 15000;

        if (banGhiChuaChot) {
          const giaDienApDung = banGhiChuaChot.giaDienApDung ?? giaDienSystem;
          const giaNuocApDung = banGhiChuaChot.giaNuocApDung ?? giaNuocSystem;
          await tx.dienNuoc.updateMany({
            where: {
              phongId: phongId,
              thangNam: thangNam,
              lanGhi: banGhiChuaChot.lanGhi,
            },
            data: {
              chiSoDienCu: cuDien,
              chiSoDienMoi: moiDien,
              chiSoNuocCu: cuNuoc,
              chiSoNuocMoi: moiNuoc,
              giaDienApDung: giaDienApDung, //Lưu giá điẹn nước ngay lúc đó
              giaNuocApDung: giaNuocApDung,
              anhDienMoi: danhSachUrlAnh.anhDienMoi ?? banGhiChuaChot.anhDienMoi,
              anhNuocMoi: danhSachUrlAnh.anhNuocMoi ?? banGhiChuaChot.anhNuocMoi,
              TrangThai: 1,
            },
          });
        } else {
          const giaDienApDung = giaDienSystem;
          const giaNuocApDung = giaNuocSystem;
          const banGhiCuoi = await tx.dienNuoc.findFirst({
            where: { phongId: phongId, thangNam: thangNam },
            orderBy: { lanGhi: 'desc' },
          });

          const nextLanGhi = banGhiCuoi ? banGhiCuoi.lanGhi + 1 : 1;

          await tx.dienNuoc.create({
            data: {
              phongId: phongId,
              thangNam: thangNam,
              lanGhi: nextLanGhi,
              chiSoDienCu: cuDien,
              chiSoDienMoi: moiDien,
              chiSoNuocCu: cuNuoc,
              chiSoNuocMoi: moiNuoc,
              giaDienApDung: giaDienApDung, 
              giaNuocApDung: giaNuocApDung,
              anhDienMoi: danhSachUrlAnh.anhDienMoi ?? null,
              anhNuocMoi: danhSachUrlAnh.anhNuocMoi ?? null,
              TrangThai: 1,
              ngayGhi: dto.ngayLap ? new Date(dto.ngayLap) : new Date(),
            },
          });
        }
      }

      const tienDichVuKhacPerCustomer = Number(dto.tienDichVuKhac ?? 0);

      const countExistingInMonth = await tx.hoaDonPhong.count({
        where: { thangNam: thangNam },
      });

      let sttHoaDon = countExistingInMonth + 1;

      let pendingHopDongList: any[] = [];
      if (dto.danhSachHopDongJson) {
        pendingHopDongList = dsHopDong.filter((hd) => !hd.isAlreadyBilled);
      }

      for (const hd of pendingHopDongList) {
        const keyByHopDongId = String(hd.hopDongId).trim();
        const keyByIdnt = String(hd.idnt).trim();

        let customItem = customContractsMap.get(keyByHopDongId) || customContractsMap.get(keyByIdnt);

        if (!customItem && customContractsMap.size === 1 && pendingHopDongList.length === 1) {
          customItem = customContractsMap.values().next().value;
        }

        let finalTienPhong = hd.calculatedTienPhong;
        let finalDanhSachXe = hd.danhSachXe;
        let finalGhiChu = dto.ghiChu ?? '';

        if (customItem) {
          if (customItem.calculatedTienPhong !== undefined && customItem.calculatedTienPhong !== null) {
            finalTienPhong = Number(customItem.calculatedTienPhong);
          }
          if (Array.isArray(customItem.danhSachXe)) {
            finalDanhSachXe = customItem.danhSachXe;
          }
          if (customItem.ghiChu !== undefined && customItem.ghiChu !== null) {
            finalGhiChu = String(customItem.ghiChu).trim();
          }
        }

        const tongTienXe = finalDanhSachXe.reduce(
          (sum: number, x: any) => sum + Number(x.price ?? 0),
          0,
        );

        const maHoaDonCaNhan = `HD${cleanThangNam}-${sttHoaDon}`;
        sttHoaDon++;

        const tongTienCaNhan = finalTienPhong + tongTienXe + tienDichVuKhacPerCustomer;

        //khi click tạo hóa đơn thì nó sẽ check vào tạo hóa đơn xe cho ngthue
        for (const xe of finalDanhSachXe) {
          const xeId = Number(xe.id ?? xe.ID);
          const xePrice = Number(xe.price ?? 0);

          if (xeId) {
            const existingGuiXe = await tx.hoaDonGuiXe.findFirst({
              where: {
                idPT: xeId,
                thangNam: thangNam,
                isDelete: false,
              },
            });

            if (existingGuiXe) {
              await tx.hoaDonGuiXe.update({
                where: { maHoaDon: existingGuiXe.maHoaDon },
                data: {
                  soTien: new Prisma.Decimal(xePrice),
                  isDelete: false,
                },
              });
            } else {
              await tx.hoaDonGuiXe.create({
                data: {
                  thangNam: thangNam,
                  soTien: new Prisma.Decimal(xePrice),
                  TrangThai: 0,
                  idPT: xeId,
                  isDelete: false,
                },
              });
            }
          }
        }

        // CẬP NHẬT SNAPSHOT CHI TIẾT ĐẦY ĐỦ THÀNH PHẦN
        const snapshotCaNhan = {
          maHoaDon: maHoaDonCaNhan,
          type: 'HOP_DONG',
          isDienNuocOnly: false,
          hopDongId: hd.hopDongId,
          hoTen: hd.hoTen,
          tenPhong: previewData.tenPhong,
          thangNam: thangNam,
          ngayLap: dto.ngayLap ? new Date(dto.ngayLap).toISOString() : new Date().toISOString(),
          danhSachKhachThue: [
            {
              hoTen: hd.hoTen,
              noteFormula: hd.noteFormula,
              calculatedAmount: finalTienPhong,
            },
          ],
          danhSachXe: finalDanhSachXe,
          tienDichVuKhac: tienDichVuKhacPerCustomer,
          tongTienPhong: finalTienPhong,
          tongTienXe: tongTienXe,
          tongThanhToan: tongTienCaNhan,
          ghiChu: finalGhiChu,
        };

        const hoaDonMoi = await tx.hoaDonPhong.create({
          data: {
            maHoaDon: maHoaDonCaNhan,
            hopDongId: hd.hopDongId,
            thangNam: thangNam,
            ngayLap: dto.ngayLap ? new Date(dto.ngayLap) : new Date(),
            soTien: new Prisma.Decimal(tongTienCaNhan),
            chiTietJson: JSON.stringify(snapshotCaNhan),
            trangThai: 0,
            ghiChu: finalGhiChu !== '' ? finalGhiChu : null,
            isDelete: false,
          },
        });

        createdInvoices.push(hoaDonMoi);
      }

      // Thêm lại: invalidate snapshot thống kê sau khi tạo hóa đơn / chốt điện nước
      await this.thongKeSnapshot.invalidateAll(tx);

      return {
        success: true,
        message: `Đã tạo hóa đơn thành công cho phòng ${previewData.tenPhong}!`,
        data: createdInvoices,
      };
    });
  }

  async getDanhSachByPhong(phongId: number, thangNam?: string) {
    const cauHinhGia = await this.prisma.cauHinhGia.findFirst({orderBy: { id: 'desc' },});
    const giaDien = cauHinhGia?.giaDien ?? 3500;
    const giaNuoc = cauHinhGia?.giaNuoc ?? 15000;

    const invoices = await this.prisma.hoaDonPhong.findMany({
      where: {
        isDelete: false,
        hopDong: { phongId: phongId },
        ...(thangNam ? { thangNam } : {}),
      },
      include: {
        hopDong: {
          include: {
            nguoithue: true,
            phong: true,
          },
        },
        phieuThuHangThang: {
          where: { isDelete: false },
        },
      },
      orderBy: { ngayLap: 'desc' },
    });

    const resultList: any[] = invoices.map((hd) => {
      const tongTien = Number(hd.soTien ?? 0);
      const phieuThu = hd.phieuThuHangThang;
      const tongDaThu = (phieuThu && !phieuThu.isDelete) ? Number(phieuThu.soTien ?? 0) : 0;
      const conNo = tongTien - tongDaThu > 0 ? tongTien - tongDaThu : 0;

      return {
        maHoaDon: hd.maHoaDon,
        hopDongId: hd.hopDongId,
        hoTenKhach: hd.hopDong?.nguoithue?.hoTen ?? 'Khách thuê',
        sdtKhach: hd.hopDong?.nguoithue?.sdt ?? '',
        tenPhong: hd.hopDong?.phong?.tenPhong ?? '',
        thangNam: hd.thangNam,
        ngayLap: hd.ngayLap,
        soTien: tongTien,
        tongDaThu,
        conNo,
        trangThai: hd.trangThai,
        chiTietJson: hd.chiTietJson,
        phieuThuHangThang: (phieuThu && !phieuThu.isDelete) ? {
          soTien: Number(phieuThu.soTien ?? 0),
          ngayThu: phieuThu.ngayThu,
          ghiChu: phieuThu.ghiChu,
        } : null,
      };
    });

    if (thangNam) {
      const danhSachDienNuocDaChot = await this.prisma.dienNuoc.findMany({
        where: {
          phongId: phongId,
          thangNam: thangNam,
          TrangThai: 1,
        },
        include: {
          phieuThuDienNuoc: {
            where: { isDelete: false },
          },
          phong: true,
        },
        orderBy: { lanGhi: 'desc' },
      });

      for (const dn of danhSachDienNuocDaChot) {
        const cuDien = dn.chiSoDienCu;
        const moiDien = dn.chiSoDienMoi;
        const suDungDien = moiDien - cuDien > 0 ? moiDien - cuDien : 0;
        

        const cuNuoc = dn.chiSoNuocCu;
        const moiNuoc = dn.chiSoNuocMoi;
        const suDungNuoc = moiNuoc - cuNuoc > 0 ? moiNuoc - cuNuoc : 0;

        const giaDienDung = dn.giaDienApDung ?? giaDien;
        const giaNuocDung = dn.giaNuocApDung ?? giaNuoc;

        const tienNuoc = suDungNuoc * giaNuocDung;
        const tienDien = suDungDien * giaDienDung;

        const tongTienDN = tienDien + tienNuoc;
        const daThuDN = Number(dn.phieuThuDienNuoc?.soTien ?? 0);
        const isPaid = daThuDN >= tongTienDN && tongTienDN > 0;

        const cleanThangNam = thangNam.replace('/', '');
        const maHDDN = `HD-DN-${phongId}-${cleanThangNam}-L${dn.lanGhi}`;

        const snapshotDienNuoc = {
          maHoaDon: maHDDN,
          type: 'DIEN_NUOC',
          isDienNuocOnly: true,
          phongId: phongId,
          lanGhi: dn.lanGhi,
          tenPhong: dn.phong?.tenPhong ?? `Phòng ${phongId}`,
          thangNam: thangNam,
          ngayLap: dn.ngayGhi,
          tongThanhToan: tongTienDN,
          chiTietDienNuoc: {
            dien: {
              cu: cuDien,
              moi: moiDien,
              suDung: suDungDien,
              donGia: giaDienDung,
              thanhTien: tienDien,
            },
            nuoc: {
              cu: cuNuoc,
              moi: moiNuoc,
              suDung: suDungNuoc,
              donGia: giaNuocDung,
              thanhTien: tienNuoc,
            },
          },
          ghiChu: `Chốt chỉ số điện nước tháng ${thangNam} (Lần ${dn.lanGhi})`,
        };

        resultList.unshift({
          maHoaDon: maHDDN,
          hopDongId: '',
          hoTenKhach: `Cả phòng ${phongId} (Lần ${dn.lanGhi})`,
          tenPhong: dn.phong?.tenPhong ?? `Phòng ${phongId}`,
          thangNam: thangNam,
          ngayLap: dn.ngayGhi,
          soTien: tongTienDN,
          tongDaThu: daThuDN,
          conNo: tongTienDN - daThuDN > 0 ? tongTienDN - daThuDN : 0,
          trangThai: isPaid ? 2 : 0,
          chiTietJson: JSON.stringify(snapshotDienNuoc),
          phieuThuHangThang: dn.phieuThuDienNuoc ? {
            soTien: Number(dn.phieuThuDienNuoc.soTien ?? 0),
            ngayThu: dn.phieuThuDienNuoc.ngayThu,
            ghiChu: dn.phieuThuDienNuoc.ghiChu, // Ghi chú thu tiền điện nước
          } : null,
        });
      }
    }

    return resultList;
  }

  async getChiTietHoaDon(maHoaDon: string) {
    const hoaDon = await this.prisma.hoaDonPhong.findUnique({
      where: { maHoaDon: maHoaDon, isDelete: false },
      include: {
        hopDong: {
          include: {
            nguoithue: true,
            phong: true,
          },
        },
        phieuThuHangThang: true,
      },
    });

    if (!hoaDon) {
      throw new NotFoundException(`Không tìm thấy hóa đơn mã ${maHoaDon}`);
    }

    const tongTien = Number(hoaDon.soTien ?? 0);

    const phieuThu = hoaDon.phieuThuHangThang;
    const tongDaThu = (phieuThu && !phieuThu.isDelete) ? Number(phieuThu.soTien ?? 0) : 0;
    const conNo = tongTien - tongDaThu > 0 ? tongTien - tongDaThu : 0;

    return {
      success: true,
      data: {
        ...hoaDon,
        tongTien,
        tongDaThu,
        conNo,
      },
    };
  }

  async deleteHoaDonPhong(maHoaDon: string) {
    const hoaDon = await this.prisma.hoaDonPhong.findUnique({
      where: { maHoaDon: maHoaDon },
    });

    if (!hoaDon || hoaDon.isDelete) {
      throw new NotFoundException(
        `Không tìm thấy hóa đơn mã ${maHoaDon} hoặc hóa đơn này đã bị xóa!`,
      );
    }

    if (hoaDon.trangThai !== 0) {
      throw new BadRequestException(
        `Hóa đơn ${maHoaDon} đã phát sinh thanh toán, không được phép xóa để đảm bảo an toàn dữ liệu!`,
      );
    }

    // Bọc trong transaction để invalidate snapshot thống kê cùng lúc với việc xóa
    return await this.prisma.$transaction(async (tx) => {
      const hoaDonDaXoa = await tx.hoaDonPhong.update({
        where: { maHoaDon: maHoaDon },
        data: { isDelete: true },
      });

      // PARSE CHI TIẾT JSON ĐỂ ROLLBACK HÓA ĐƠN GỬI XE VỀ isDelete: true
      try {
        if (hoaDon.chiTietJson) {
          const parsedSnap = JSON.parse(hoaDon.chiTietJson as string);
          const danhSachXe = parsedSnap.danhSachXe;

          if (Array.isArray(danhSachXe) && danhSachXe.length > 0) {
            for (const xe of danhSachXe) {
              const xeId = Number(xe.id ?? xe.ID);
              if (xeId) {
                await tx.hoaDonGuiXe.updateMany({
                  where: {
                    idPT: xeId,
                    thangNam: hoaDon.thangNam,
                    isDelete: false,
                  },
                  data: { isDelete: true }, //Set hóa đơn xe thành đã xóa (ẩn đi)
                });
              }
            }
          }
        }
      } catch (e) {
        console.error('Lỗi rollback hóa đơn gửi xe khi xóa hóa đơn phòng:', e);
      }

      await this.thongKeSnapshot.invalidateAll(tx);

      return {
        success: true,
        message: `Đã xóa hóa đơn ${maHoaDon} thành công! Hợp đồng này đã được rollback về trạng thái chờ tạo hóa đơn.`,
        data: hoaDonDaXoa,
      };
    });
  }
}