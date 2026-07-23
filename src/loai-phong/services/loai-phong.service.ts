import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLoaiPhongDto } from '../dto/create-loai-phong.dto';
import { UpdateLoaiPhongDto } from '../dto/update-loai-phong.dto';

@Injectable()
export class LoaiPhongService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.loaiPhong.findMany({
     where: { isDelete: false },//isdelete là lấy những loại phòng chưa xóa
    });
  }
  async create(dto: CreateLoaiPhongDto) {
    //Kiểm tra xem tên loại phòng này đã tồn tại chưa (tránh trùng tên)
    const loaiPhongTrung = await this.prisma.loaiPhong.findFirst({
      where: {
        tenLoaiPhong: dto.tenLoaiPhong.trim(),
         isDelete: false, 
      },
    });

    if (loaiPhongTrung) {
      throw new BadRequestException(`Loại phòng với tên "${dto.tenLoaiPhong}" đã tồn tại trên hệ thống!`);
    }

    try {
      const newLoaiPhong = await this.prisma.loaiPhong.create({
        data: {
          tenLoaiPhong: dto.tenLoaiPhong.trim(),
          dienTich: dto.dienTich,
          soNguoiToiDa: dto.soNguoiToiDa,
          isMayLanh: dto.isMayLanh,
          giaTien: dto.giaTien,
          // maLoaiPhong tự tăng nên không cần truyền vào 
        },
      });

      return {
        success: true,
        message: 'Thêm mới loại phòng thành công!',
        data: newLoaiPhong,
      };
    } catch (error) {
      console.error('Lỗi hệ thống khi thêm loại phòng:', error);
      throw new InternalServerErrorException('Không thể thêm loại phòng do lỗi hệ thống');
    }
  }
  async update(dto: UpdateLoaiPhongDto) {
    // Kiểm tra xem loại phòng này có tồn tại trong DB không
    const loaiPhongTonTai = await this.prisma.loaiPhong.findUnique({
      where: { maLoaiPhong: dto.maLoaiPhong },
    });

    if (!loaiPhongTonTai) {
      throw new NotFoundException('Không tìm thấy loại phòng cần cập nhật!');
    }

    // Kiểm tra trùng tên với một loại phòng KHÁC (tránh sửa tên trùng với loại đã có)
    const loaiPhongTrungTen = await this.prisma.loaiPhong.findFirst({
      where: {
        tenLoaiPhong: dto.tenLoaiPhong.trim(),
        NOT: {
          maLoaiPhong: dto.maLoaiPhong, // Loại trừ chính nó ra
        },
      },
    });

    if (loaiPhongTrungTen) {
      throw new BadRequestException(`Tên loại phòng "${dto.tenLoaiPhong}" đã được sử dụng bởi một danh mục khác!`);
    }

    try {
      const updatedLoaiPhong = await this.prisma.loaiPhong.update({
        where: { maLoaiPhong: dto.maLoaiPhong },
        data: {
          tenLoaiPhong: dto.tenLoaiPhong.trim(),
          dienTich: dto.dienTich,
          soNguoiToiDa: dto.soNguoiToiDa,
          isMayLanh: dto.isMayLanh,
          giaTien: dto.giaTien,
        },
      });

      return {
        success: true,
        message: 'Cập nhật loại phòng thành công!',
        data: updatedLoaiPhong,
      };
    } catch (error) {
      console.error('Lỗi hệ thống khi cập nhật loại phòng:', error);
      throw new InternalServerErrorException('Không thể cập nhật loại phòng do lỗi hệ thống');
    }
  }
async remove(maLoaiPhong: number) {
    //Kiểm tra xem loại phòng này có tồn tại không
    const loaiPhong = await this.prisma.loaiPhong.findUnique({
      where: { maLoaiPhong },
    });

    if (!loaiPhong) {
      throw new NotFoundException('Không tìm thấy loại phòng cần ẩn!');
    }

    //Kiểm tra ràng buộc
    const phongDangSuDung = await this.prisma.phong.findFirst({
      where: { maLoaiPhong: maLoaiPhong },
    });

    if (phongDangSuDung) {
      throw new BadRequestException(
        `Không thể ẩn! Loại phòng "${loaiPhong.tenLoaiPhong}" đang được sử dụng bởi các phòng khác trong hệ thống.`,
      );
    }

    try {
      await this.prisma.loaiPhong.update({
        where: { maLoaiPhong },
        data: { isDelete: true },
      });

      return {
        success: true,
        message: 'Ẩn loại phòng thành công!',
      };
    } catch (error) {
      console.error('Lỗi hệ thống khi ẩn loại phòng:', error);
      throw new InternalServerErrorException('Không thể ẩn loại phòng do lỗi hệ thống');
    }
  }

  //-------------------------------

  async findOne(id: number) {
    const item = await this.prisma.loaiPhong.findUnique({
      where: { maLoaiPhong: id },
      include: { phong: { select: { phongId: true, tenPhong: true, trangThai: true } } },
    });
    if (!item) throw new NotFoundException(`LoaiPhong với id ${id} không tồn tại`);
    return item;
  }

}
