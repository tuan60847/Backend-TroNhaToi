import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNguoiThueDto } from '../dto/create-nguoi-thue.dto';
import { UpdateNguoiThueDto } from '../dto/update-nguoi-thue.dto';

@Injectable()
export class NguoiThueService {
  constructor(private prisma: PrismaService) {}

  //Lấy tất cả người thuê bao gồm những người vừa thêm vào và chưa có hợp đồng nào và sắp xếp đẩy người mới thêm lên đầu
  async findAllNguoiThue(){
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
  async findRoom_NguoiThue(id : number){
    const listHopDong= await this.prisma.hopDong.findMany({
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
    return listHopDong.filter((hd)=>hd.phong!==null && hd.isDelete===false); // list lấy cả thông tin  hợp đồng, phòng và loại phòng theo id người thuê
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
    return this.prisma.nguoiThue.create({ 
      data: {
        ...dto,
        ngaySinh: dto.ngaySinh ? new Date(dto.ngaySinh) : null,
      } as any,
    });
  }

  async update(id: number, dto: UpdateNguoiThueDto) {
    await this.findOne(id);
    return this.prisma.nguoiThue.update({ where: { idnt: id }, data: dto as any });
  }

  async remove(id: number) {
    const tenant= await this.prisma.nguoiThue.findUnique({
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
    return await this.prisma.nguoiThue.update({
        where: { idnt: id },
        data: { isDelete: true },
    });
  }
}
