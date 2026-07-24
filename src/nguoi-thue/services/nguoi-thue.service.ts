import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNguoiThueDto } from '../dto/create-nguoi-thue.dto';
import { UpdateNguoiThueDto } from '../dto/update-nguoi-thue.dto';
import { ThongKeSnapshotService } from '../../thong-ke/services/thong-ke-snapshot.service';

@Injectable()
export class NguoiThueService {
  constructor(
    private prisma: PrismaService,
    private thongKeSnapshotService: ThongKeSnapshotService,
  ) { }

  //Lấy tất cả người thuê bao gồm những người vừa thêm vào và chưa có hợp đồng nào và sắp xếp đẩy người mới thêm lên đầu
  async findAllNguoiThue() {
    return this.prisma.nguoiThue.findMany({
      where: { isDelete: false },
      orderBy: { idnt: 'desc' },
    });
  }
  // Lấy danh sách người thuê có thể tạo hợp đồng (bao gồm những người chưa có hợp đồng và những người đã có hợp đồng)
  async getNguoiThueAvailableForContract() {
    return this.prisma.nguoiThue.findMany({
      where: {
        isDelete: false,
        trangThai: { in: [0, 1] }   // Chỉ lấyd những người có trạng thái 0(chưa thuê chỉ mới tạo) 1(đang thuê) còn những người đã dọn đi thì không lấy
      },
      select: {
        idnt: true,
        hoTen: true,
      },
      orderBy: {
        hoTen: 'asc',
      }
    });
  }
  async findRoom_NguoiThue(id: number) {
    const listHopDong = await this.prisma.hopDong.findMany({
      where: {
        idnt: id,
        isDelete: false, // chỉ lấy những hợp đồng còn hiệu lực
        trangThai: { not: 2 } // chỉ lấy những hợp đồng có trạng thái khác 2(đã dọn đi)
      },
      include: {
        phong: {
          include: {
            loaiPhong: true,
          }
        }
      }
    });
    return listHopDong.filter((hd) => hd.phong !== null && hd.isDelete === false); // list lấy cả thông tin  hợp đồng, phòng và loại phòng theo id người thuê
  }

  async findOne(id: number) {
    const item = await this.prisma.nguoiThue.findUnique({
      where: { idnt: id },
      // include: { hopDong: { include: { phong: true } }, phuongTien: true },
    });
    if (!item) throw new NotFoundException(`NguoiThue với id ${id} không tồn tại`);
    return item;
  }

  create(dto: CreateNguoiThueDto) {
    return this.prisma.$transaction(async (tx) => {
      const nguoiThue = await tx.nguoiThue.create({
        data: {
          ...dto,
          ngaySinh: dto.ngaySinh ? new Date(dto.ngaySinh) : null,
        } as any,
      });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return nguoiThue;
    });
  }

  async update(id: number, dto: UpdateNguoiThueDto) {
    // Tìm xem người thuê có tồn tại không
    const tenant = await this.findOne(id);

    //Nếu trạng thái là 2 (Đã dọn đi) thì báo lỗi ngay
    if (tenant.trangThai === 2) {
      throw new BadRequestException(
        'Không thể cập nhật! Người thuê này đã dọn đi và không còn hoạt động trong hệ thống.',
      );
    }

    //Chuẩn hóa lại ngày sinh nếu người dùng có chỉnh sửa ngày sinh dạng chuỗi
    const updateData = {
      ...dto,
      ngaySinh: dto.ngaySinh ? new Date(dto.ngaySinh) : tenant.ngaySinh,
    };

    //Tiến hành cập nhật thông tin dữ liệu xuống Database
    return this.prisma.$transaction(async (tx) => {
      const nguoiThue = await tx.nguoiThue.update({
        where: { idnt: id },
        data: updateData as any,
      });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return nguoiThue;
    });
  }

  async remove(id: number) {
    const tenant = await this.prisma.nguoiThue.findUnique({
      where: { idnt: id },
    });
    if (!tenant) {
      throw new NotFoundException(`Người thuê với id ${id} không tồn tại`);
    }
    const hasHopDong = await this.prisma.hopDong.findFirst({
      where: { idnt: id, isDelete: false, trangThai: { not: 2 } }, // Kiểm tra hợp đồng chưa bị xóa và chưa dọn đi
    });
    if (hasHopDong) {
      throw new BadRequestException(`Không thể xóa người thuê có hợp đồng đang hoạt động`);
    }
    return this.prisma.$transaction(async (tx) => {
      const nguoiThue = await tx.nguoiThue.update({
        where: { idnt: id },
        data: { isDelete: true },
      });
      await this.thongKeSnapshotService.invalidateAll(tx);
      return nguoiThue;
    });
  }

  async getNguoiThueCongNoTapHoa() {
    const nguoiThues = await this.prisma.nguoiThue.findMany({
      where: {
        isDelete: false,
      },
      include: {
        hoaDonTapHoa: {
          where: {
            isDelete: false,
          },
          include: {
            phieuThuHdTh: {
              where: {
                isDelete: false,
              },
              select: {
                soTien: true,
              },
            },
          },
        },
      },
    });

    return nguoiThues
      .map((nguoiThue) => {
        const tongCongNoTapHoa = nguoiThue.hoaDonTapHoa.reduce(
          (tongNo, hoaDon) => {
            const daThu = hoaDon.phieuThuHdTh.reduce(
              (sum, pt) => sum + Number(pt.soTien),
              0,
            );

            return tongNo + (Number(hoaDon.tongTien) - daThu);
          },
          0,
        );

        const { hoaDonTapHoa, ...data } = nguoiThue;

        return {
          ...data,
          tongCongNoTapHoa,
        };
      })
      .filter((item) => item.tongCongNoTapHoa > 0);
  }
}
