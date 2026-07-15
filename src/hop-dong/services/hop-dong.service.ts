import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHopDongDto } from '../dto/create-hop-dong.dto';
import { UpdateHopDongDto } from '../dto/update-hop-dong.dto';
import { SearchHopDongDto } from '../dto/search-hop-dong.dto';
import { generateId } from '../../common/utils/generate-id.util';

@Injectable()
export class HopDongService {
  constructor(private prisma: PrismaService) {}
  //Lấy ds  hợp đồng 
  async findAll() {
    const  dsHopDong = await this.prisma.hopDong.findMany({
      where: {isDelete: false},
      include: { 
        phong: { 
          select:{
            tenPhong: true,
            loaiPhong:{
              select:{
                giaTien: true,
              }
            }
          }
         },
         nguoithue: {
          select:{
            hoTen: true,
          }
         }
      },
      orderBy: {
        ngayKy: 'desc',
      },
    });
    return dsHopDong.map((hd)=> ({
      ...hd,
      anhHopDong: hd.anhHopDong ? hd.anhHopDong.split(',') : [] // Chuyển chuỗi ảnh thành mảng
    }));
  }
  //Lấy danh sách phòng available cho việc tạo hợp đồng
  // (bao gồm phòng chưa có hợp đồng và phòng đã có hợp đồng nhưng mà số lượng nhỏ hơn mức cho phép)
  async getRoomsAvailableForContract() {
    const rooms= await this.prisma.phong.findMany({
      where: {
        isDelete: false,
      },
      include: {
        loaiPhong: true,
        HopDong: {
          where: {
            isDelete: false,
            trangThai: { not: 2 } // Chỉ tinhs những hợp đồng chưa bị xóa và chưa dọn đi
          },
        }
      }
    }) ;
    return rooms.filter(phong=> {
      const soLuongHopDong = phong.HopDong.length;
      const soLuongToiDa = phong.loaiPhong?.soNguoiToiDa;
      return soLuongHopDong ==0 || soLuongHopDong < soLuongToiDa;
    }).map(phong=> ({
      id: phong.phongId,
      tenPhong: phong.tenPhong,
      giaPhongGoc: phong.loaiPhong.giaTien, // khi chọn phòng để tạo hợp đồng thì app sẽ điền luôn giá của phòng đó lên ô giá phòng
    }))
  }

  async create(dto: CreateHopDongDto, listUrlImage: string[]) {
    // dùng transaction để đảm bảo tính toàn vẹn dữ liệu, nếu có lỗi thì nó tự rollback
    return await this.prisma.$transaction(async (prisma) => {
      return await this._createHopDong(prisma, dto, listUrlImage);
  });
  }
  //Tạo 1 hàm chung như này để có thể dùng chung, đặc biết trong cái update hợp đồng, vì nếu ko truyền prisma vàodungf chung thì trong update sẽ có tới 2 transaction, mà trong 1 transaction thì ko thể gọi transaction khác được, nên phải dùng chung 1 transaction
  private async _createHopDong(prisma: any, dto: CreateHopDongDto, listUrlImage: string[]){
     // Lấy thông tin phòng để lấy tên phòng làm id hợp đồng
    const infoPhong = await prisma.phong.findUnique({
      where: { phongId: dto.phongId },
    });

    if (!infoPhong) {
      throw new BadRequestException('Không tìm thấy phòng thuê hợp lệ để lập hợp đồng.');
    }

    // Đếm số lượng hợp đồng cũ của riêng phòng này để lấy làm số đuôi của mã hợp đồng
    const countHopDongCuaPhong = await prisma.hopDong.count({
      where: { phongId: dto.phongId },
    });
    const soThuTuNext = countHopDongCuaPhong + 1; 

    //Kiểm tra trùng hợp đồng
    const hopDongTrung = await prisma.hopDong.findFirst({
      where: {
        phongId: dto.phongId,
        idnt: dto.idnt,
        isDelete: false,
        trangThai: { not: 2 }, // Chặn nếu đang tồn tại HD khởi tạo (0) hoặc hiệu lực (1)
      },
    });
    if (hopDongTrung) {
      const loai = hopDongTrung.trangThai === 0 ? 'đang chờ hiệu lực' : 'đang hiệu lực';
      throw new BadRequestException(
        `Người thuê này đã có hợp đồng ${loai} với phòng đã chọn. Không thể tạo trùng!`
      );
    }
   
      try {
        const homNay = new Date();
        homNay.setHours(0, 0, 0, 0);
        
        const ngayKy = dto.ngayKy ? new Date(dto.ngayKy) : new Date();
        ngayKy.setHours(0, 0, 0, 0);

        let trangThaiPhong = 0; // Mặc định là 0 (Khởi tạo
        if (ngayKy <= homNay) {
          trangThaiPhong = 1; // Nếu ngày ký <= hôm nay thì trạng thái là 1 (Đang hiệu lực)
        }

        const chuoiImageConTract = listUrlImage.length > 0 ? listUrlImage.join(',') : ''; 

        //Mã hợp đồng: NamThang-idPhong-SoThuTu
        const nam = ngayKy.getFullYear();
        const thang = String(ngayKy.getMonth() + 1).padStart(2, '0');
        const maHopDongFormat = `${nam}${thang}-${infoPhong.phongId}-${soThuTuNext}`;

        const newHopDong = await prisma.hopDong.create({
          data: {
            hopDongId: maHopDongFormat,
            idnt: dto.idnt,
            phongId: dto.phongId,
            ngayKy: dto.ngayKy ? new Date(dto.ngayKy) : new Date(),
            ngayHetHan: dto.ngayHetHan ? new Date(dto.ngayHetHan) : new Date(),
            tienCoc: dto.tienCoc ?? 0,
            giaPhongThucTe: dto.giaPhongThucTe ?? 0,
            trangThai: trangThaiPhong,
            ghiChu: dto.ghiChu ?? '',
            anhHopDong: chuoiImageConTract 
          },
        });

        // Khi phòng có hợp đồng thì cập nhật lại trạng thái đang thuê
        if (trangThaiPhong === 1) {
          await prisma.phong.update({
            where: { phongId: dto.phongId },
            data: { trangThai: 1 }, 
          });

          // Cập nhật trạng thái người thuê sang Đang hoạt động 
          await prisma.nguoiThue.update({
            where: { idnt: dto.idnt },
            data: { trangThai: 1 },
          });
        }

        return {
          success: true,
          message: trangThaiPhong === 1 
            ? 'Tạo mới và kích hoạt hợp đồng thành công!' 
            : 'Tạo hợp đồng chờ hiệu lực thành công!',
          data: newHopDong,
        };

      } catch (error) {
         if (error instanceof BadRequestException || error instanceof NotFoundException) {
            throw error;
       }
        console.error('Lỗi hệ thống khi xử lý lưu hợp đồng:', error);
        throw new InternalServerErrorException('Không thể hoàn tất lưu hợp đồng do lỗi hệ thống');
      }
    
  }
  //Update hợp đồng(update nhưng thực chất là set trạng thái hợp đồng cũ thành hết hiệu lực và tạo mới hợp đồng với thông tin mới)
  async update(id: string, dto: UpdateHopDongDto,listUrlImage: string[]) {
    const existingHopDong = await this.prisma.hopDong.findFirst({
      where: { hopDongId: id, isDelete: false },
    });
    if (!existingHopDong) {
      throw new NotFoundException(`Hợp đồng với id ${id} không tồn tại`);
    }
     //Thêm check chỗ phòng mới gia hạn hoặc sửa thì phải trùng với phòng cũ chứ ko được nhảy qua phòng mới
  if (dto.phongId !== existingHopDong.phongId) {
    throw new BadRequestException(
      'Không thể chuyển hợp đồng sang phòng khác. Nếu muốn thuê phòng mới, vui lòng tạo hợp đồng mới!'
    );
  }
  //Nếu hợp đồng trc đó đang ở trạng thái khởi tạo thì update trực tiếp, ko cần tạo hợp đồng mới
  if (existingHopDong.trangThai === 0) {
    const chuoiImageConTract = listUrlImage.length > 0
      ? listUrlImage.join(',')
      : existingHopDong.anhHopDong ?? ''; // giữ ảnh cũ nếu không upload ảnh mới

    return await this.prisma.hopDong.update({
      where: { hopDongId: id },
      data: {
        ngayKy: dto.ngayKy ? new Date(dto.ngayKy) : undefined,
        ngayHetHan: dto.ngayHetHan ? new Date(dto.ngayHetHan) : undefined,
        tienCoc: dto.tienCoc,
        giaPhongThucTe: dto.giaPhongThucTe,
        ghiChu: dto.ghiChu,
        anhHopDong: chuoiImageConTract,
      },
    });
  } 
  // Nếu hợp đồng đã hết hiệu lực thì không cho renew nữa
if (existingHopDong.trangThai === 2) {
  throw new BadRequestException(
    'Hợp đồng này đã hết hiệu lực, không thể gia hạn. Vui lòng tạo hợp đồng mới!'
  );
}

    // Nếu hợp đồng cũ đang ở trạng thái hiệu lực hoặc hết hiệu lực, thì set hợp đồng cũ thành hết hiệu lực và tạo hợp đồng mới
    return await this.prisma.$transaction(async (prisma) => {
     await prisma.hopDong.update({
        where: { hopDongId: id },
        data: { trangThai: 2 }, // Cập nhật hợp đồng cũ thành hết hiệu lực
      });
     return await this._createHopDong(prisma, dto as CreateHopDongDto, listUrlImage); // Tạo hợp đồng mới với thông tin mới
    });
  }
//--------------------------------------------------------------------------------
 async findOne(id: string) {
    const item = await this.prisma.hopDong.findFirst({
      where: { hopDongId: id, isDelete: false },
      //include: { nguoiThue: true, phong: { include: { loaiPhong: true } }, hoaDonPhong: true },
    });
    if (!item) throw new NotFoundException(`HopDong với id ${id} không tồn tại`);
    return item;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.hopDong.update({ where: { hopDongId: id }, data: { isDelete: true } });
  }
  async search(req: SearchHopDongDto) {
    const { ma, limit = 10, offset = 0, sortBy = 'hopDongId', sort = 'desc' } = req;
    const where: any = { isDelete: false };

    if (ma) {
      where.hopDongId = { contains: ma };
    }

    const [data, total] = await Promise.all([
      this.prisma.hopDong.findMany({
        where,
        orderBy: { [sortBy]: sort },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.hopDong.count({ where }),
    ]);

    return { total, data };
  }

  getAllLoadingBalance(id?: string) {
    return this.prisma.hopDong.findMany({
      where: { isDelete: false },
      orderBy: { hopDongId: 'asc' },
      take: 15,
      ...(id !== undefined && id !== null
        ? { skip: 1, cursor: { hopDongId: id } }
        : {}),
    });
  }

}


