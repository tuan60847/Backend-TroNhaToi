import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDienNuocDto } from '../dto/create-dien-nuoc.dto';
import { UpdateDienNuocDto } from '../dto/update-dien-nuoc.dto';
import { SearchDienNuocDto } from '../dto/search-dien-nuoc.dto';
import { generateId } from '../../common/utils/generate-id.util';

@Injectable()
export class DienNuocService {
  constructor(private prisma: PrismaService) {}

  // Lấy dữ liệu khởi tạo cho Điện Nước khi vào chức năng ghi điẹn nước
  async getDienNuocInitData(phongId: number, currentThangNam: string) {
  // kiểm tra phongId có tồn tại
  const phongExists = await this.prisma.phong.findUnique({
    where: { phongId: phongId }
  });
  if (!phongExists) {
    throw new NotFoundException(`Không tìm thấy phòng với ID ${phongId}`);
  }

  // Tìm bản ghi chưa chốt (TrangThai = 0), orderBy lanGhi desc để lấy dòng mới nhất
  const openRecord = await this.prisma.dienNuoc.findFirst({
    where: {
      phongId: phongId,
      thangNam: currentThangNam,
      TrangThai: 0
    },
    orderBy: {lanGhi: 'desc'}
  });

  //đã ghi nhưng chưa lập hóa đơn -> trả về update
  if (openRecord) {
    return {
      mode: "UPDATE",
      data: openRecord // Gồm cả phongId, thangNam, lanGhi để Flutter gửi ngược lên khi PUT
    };
  }

  //Nếu KHÔNG CÓ bản ghi nào chốt (TrangThai=1), lội thẳng về bản ghi ĐẦU TIÊN CŨ NHẤT (Chỉ số đầu bàn giao)
  const oldestRecord = await this.prisma.dienNuoc.findFirst({
      where: { phongId: phongId },
      orderBy: [
        { ngayGhi: 'asc' }, // Sắp xếp tăng dần để lấy thằng sinh ra đầu tiên lịch sử
        { lanGhi: 'asc' }
      ]
    });

  // Neus Phòng mới tinh chưa từng được ghi chỉ số bao giờ
  if (!oldestRecord) {
    return {
      mode: "CREATE",
      data: {
        phongId,
        thangNam: currentThangNam,
        chiSoDienCu: 0,
        chiSoDienMoi: 0,
        chiSoNuocCu: 0,
        chiSoNuocMoi: 0,
        anhDienCu: null,
        anhDienMoi: null,
        anhNuocCu: null,
        anhNuocMoi: null,
        isFirstTime: true
      }
    };
  }

   //  chưa có hoặc đã lập hóa đơn cho chỉ số trc đó -> trả về create
  // Lấy lịch sử gần nhất,Tìm bản ghi ĐÃ CHỐT HÓA ĐƠN GẦN NHẤT (TrangThai = 1)
  const latestRecord = await this.prisma.dienNuoc.findFirst({
    where: { phongId: phongId, TrangThai: 1 },
    orderBy: [
      { ngayGhi: 'desc' },
      { lanGhi: 'desc' }
    ]
  });

  //Neeus Phòng đã có lịch sử ghi trước đó
  if (latestRecord) {
  return {
    mode: "CREATE",
    data: {
      phongId,
      thangNam: currentThangNam,
      chiSoDienCu: latestRecord.chiSoDienMoi,
      chiSoDienMoi: 0,
      chiSoNuocCu: latestRecord.chiSoNuocMoi,
      chiSoNuocMoi: 0,
      anhDienCu: latestRecord.anhDienMoi,
      anhDienMoi: null,
      anhNuocCu: latestRecord.anhNuocMoi,
      anhNuocMoi: null,
      isFirstTime: false
    }
  };
}
//Trường hợp lội ngược hết lịch sử mà không có bản ghi chốt (TrangThai = 1) nào
// Hệ thống sẽ lấy chỉ số mới của bản ghi đầu tiên cũ nhất (chỉ số bàn giao) làm chỉ số cũ cho kỳ này
return {
    mode: "CREATE",
    data: {
      phongId,
      thangNam: currentThangNam,
      chiSoDienCu: oldestRecord.chiSoDienMoi,
      chiSoDienMoi: 0,
      chiSoNuocCu: oldestRecord.chiSoNuocMoi,
      chiSoNuocMoi: 0,
      anhDienCu: oldestRecord.anhDienMoi,
      anhDienMoi: null,
      anhNuocCu: oldestRecord.anhNuocMoi,
      anhNuocMoi: null,
      isFirstTime: false
    }
  };
}

async createDienNuoc(dto: CreateDienNuocDto) {
    const { phongId, thangNam } = dto; // Lấy thông tin phongId và thangNam từ DTO

    if (!phongId || !thangNam) {
      throw new BadRequestException('Thiếu thông tin phongId hoặc thangNam');
    }

    // Kiểm tra phòng có tồn tại không
    const phongExists = await this.prisma.phong.findUnique({
      where: { phongId: phongId },
    });
    if (!phongExists) {
      throw new NotFoundException(`Không tìm thấy phòng với ID ${phongId}`);
    }
    if ((dto.chiSoDienMoi ?? 0) < (dto.chiSoDienCu ?? 0)) {
      throw new BadRequestException('Chỉ số điện mới không được nhỏ hơn chỉ số điện cũ!');
    }
    if ((dto.chiSoNuocMoi ?? 0) < (dto.chiSoNuocCu ?? 0)) {
      throw new BadRequestException('Chỉ số nước mới không được nhỏ hơn chỉ số nước cũ!');
    }

    // Tìm bản ghi cuối cùng của kỳ (tháng/năm) này để xem trạng thái của nó
    const banGhiCuoiInMonth = await this.prisma.dienNuoc.findFirst({
      where: {
        phongId: phongId,
        thangNam: thangNam,
      },
      orderBy: { lanGhi: 'desc' },
    });

    if (banGhiCuoiInMonth && banGhiCuoiInMonth.TrangThai === 0) {
      throw new BadRequestException(
        `Kỳ ${thangNam} đang có bản ghi chưa chốt, vui lòng cập nhật thay vì tạo mới!`,
      );
    }

    const nextLanGhi = banGhiCuoiInMonth ? banGhiCuoiInMonth.lanGhi + 1 : 1;

    // Tạo mới
    return await this.prisma.dienNuoc.create({
      data: {
        phongId: phongId,
        thangNam: thangNam,
        chiSoDienCu: dto.chiSoDienCu ?? 0,
        chiSoDienMoi: dto.chiSoDienMoi ?? 0,
        chiSoNuocCu: dto.chiSoNuocCu ?? 0,
        chiSoNuocMoi: dto.chiSoNuocMoi ?? 0,
        // Lưu cả 4 ảnh cũ/mới phòng trường hợp chủ trọ thay công tơ
        anhDienCu: dto.anhDienCu || null,
        anhDienMoi: dto.anhDienMoi || null,
        anhNuocCu: dto.anhNuocCu || null,
        anhNuocMoi: dto.anhNuocMoi || null,
        lanGhi: nextLanGhi,
        TrangThai: 0, // Mặc định là 0 (Chưa chốt hóa đơn)
       ngayGhi: dto.ngayGhi ? new Date(dto.ngayGhi) : new Date(),
      },
    });
  }

  async updateDienNuoc(phongId: number, thangNam: string, lanGhi: number, dto: UpdateDienNuocDto) {
  //Tìm bản ghi chỉ số cần cập nhật dựa vào bộ khóa định danh
  const banGhiHienTai = await this.prisma.dienNuoc.findFirst({
    where: {
      phongId: phongId,
      thangNam: thangNam,
      lanGhi: lanGhi,
    },
  });

  if (!banGhiHienTai) {
    throw new NotFoundException(
      `Không tìm thấy chỉ số điện nước của phòng ${phongId} tại kỳ ${thangNam} (Lần ghi: ${lanGhi})`,
    );
  }

  //Kiểm tra xem bản ghi này đã lập hóa đơn chưa
  if (banGhiHienTai.TrangThai === 1) {
    throw new BadRequestException(
      `Kỳ ${thangNam} (Lần ghi: ${lanGhi}) đã lập hóa đơn chốt sổ, không thể chỉnh sửa dữ liệu!`,
    );
  }
  const dienCu = dto.chiSoDienCu !== undefined ? Number(dto.chiSoDienCu) : banGhiHienTai.chiSoDienCu;
    const dienMoi = dto.chiSoDienMoi !== undefined ? Number(dto.chiSoDienMoi) : banGhiHienTai.chiSoDienMoi;
    const nuocCu = dto.chiSoNuocCu !== undefined ? Number(dto.chiSoNuocCu) : banGhiHienTai.chiSoNuocCu;
    const nuocMoi = dto.chiSoNuocMoi !== undefined ? Number(dto.chiSoNuocMoi) : banGhiHienTai.chiSoNuocMoi;

    if (dienMoi < dienCu) {
      throw new BadRequestException('Chỉ số điện mới không được nhỏ hơn chỉ số điện cũ!');
    }
    if (nuocMoi < nuocCu) {
      throw new BadRequestException('Chỉ số nước mới không được nhỏ hơn chỉ số nước cũ!');
    }
  await this.prisma.dienNuoc.updateMany({
    where: {
      phongId: phongId,
      thangNam: thangNam,
      lanGhi: lanGhi,
    },
    data: {
      chiSoDienCu: dto.chiSoDienCu !== undefined ? dto.chiSoDienCu : undefined,
      chiSoDienMoi: dto.chiSoDienMoi !== undefined ? dto.chiSoDienMoi : undefined,
      chiSoNuocCu: dto.chiSoNuocCu !== undefined ? dto.chiSoNuocCu : undefined,
      chiSoNuocMoi: dto.chiSoNuocMoi !== undefined ? dto.chiSoNuocMoi : undefined,
      anhDienCu: dto.anhDienCu !== undefined ? dto.anhDienCu : undefined,
      anhDienMoi: dto.anhDienMoi !== undefined ? dto.anhDienMoi : undefined,
      anhNuocCu: dto.anhNuocCu !== undefined ? dto.anhNuocCu : undefined,
      anhNuocMoi: dto.anhNuocMoi !== undefined ? dto.anhNuocMoi : undefined,
      // Đồng bộ ngày ghi thực tế do chủ trọ chỉnh sửa từ ứng dụng gửi về
      ngayGhi: dto.ngayGhi ? new Date(dto.ngayGhi) : undefined,
    },
  });

  return await this.prisma.dienNuoc.findFirst({
    where: {
      phongId: phongId,
      thangNam: thangNam,
      lanGhi: lanGhi,
    },
  });
}

  
}
