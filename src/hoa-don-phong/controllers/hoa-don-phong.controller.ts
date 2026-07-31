import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { HoaDonPhongService } from '../services/hoa-don-phong.service';
import { CreateHoaDonPhongDto } from '../dto/create-hoa-don-phong.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Hóa Đơn Phòng')
@ApiBearerAuth()
//@UseGuards(JwtAuthGuard)
@Controller('hoa-don-phong')
export class HoaDonPhongController {
  constructor(
    private readonly hoaDonPhongService: HoaDonPhongService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private async uploadSingleFile(
    fileArray?: Express.Multer.File[],
  ): Promise<string | undefined> {
    if (fileArray && fileArray.length > 0) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        fileArray[0],
      );
      return uploadResult.secure_url;
    }
    return undefined;
  }

  @Get('init-data')
  @ApiOperation({ summary: 'Lấy dữ liệu khởi tạo & xem trước cho màn hình Tạo Hóa Đơn' })
  async getInitData(
    @Query('phongId', ParseIntPipe) phongId: number,
    @Query('thangNam') thangNam: string,
  ) {
    return await this.hoaDonPhongService.getHoaDonInitData(phongId, thangNam);
  }

  @Post('create')
  @ApiOperation({ summary: 'Tạo mới hóa đơn hàng tháng cho các hợp đồng thuộc phòng' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'anhDienMoi', maxCount: 1 },
      { name: 'anhNuocMoi', maxCount: 1 },
    ]),
  )
  async create(
    @Body() body: any,
    @UploadedFiles()
    files: {
      anhDienMoi?: Express.Multer.File[];
      anhNuocMoi?: Express.Multer.File[];
    },
  ) {
    const urlAnhDienMoi = await this.uploadSingleFile(files?.anhDienMoi);
    const urlAnhNuocMoi = await this.uploadSingleFile(files?.anhNuocMoi);

    const createDto: CreateHoaDonPhongDto = {
      phongId: Number(body.phongId),
      thangNam: body.thangNam,
      ngayLap: body.ngayLap,
      isChotDienNuoc: body.isChotDienNuoc === 'true' || body.isChotDienNuoc === true,
      chiSoDienCu: body.chiSoDienCu !== undefined ? Number(body.chiSoDienCu) : undefined,
      chiSoDienMoi: body.chiSoDienMoi !== undefined ? Number(body.chiSoDienMoi) : undefined,
      chiSoNuocCu: body.chiSoNuocCu !== undefined ? Number(body.chiSoNuocCu) : undefined,
      chiSoNuocMoi: body.chiSoNuocMoi !== undefined ? Number(body.chiSoNuocMoi) : undefined,
      tienDichVuKhac: body.tienDichVuKhac !== undefined ? Number(body.tienDichVuKhac) : 0,
      ghiChu: body.ghiChu,
      danhSachHopDongJson: body.danhSachHopDongJson, 
    };

    return await this.hoaDonPhongService.createHoaDonPhong(createDto, {
      anhDienMoi: urlAnhDienMoi,
      anhNuocMoi: urlAnhNuocMoi,
    });
  }

  @Get('by-phong/:phongId')
  @ApiOperation({ summary: 'Lấy danh sách các hóa đơn cá nhân thuộc phòng trong kỳ' })
  @ApiParam({ name: 'phongId', description: 'ID Phòng' })
  async getDanhSachByPhong(
    @Param('phongId', ParseIntPipe) phongId: number,
    @Query('thangNam') thangNam?: string,
  ) {
    return await this.hoaDonPhongService.getDanhSachByPhong(phongId, thangNam);
  }

  @Get('detail/:maHoaDon')
  @ApiOperation({ summary: 'Lấy chi tiết hóa đơn cá nhân theo Mã Hóa Đơn' })
  @ApiParam({ name: 'maHoaDon', description: 'Mã hóa đơn (VD: HD-HD01-072026)' })
  async getChiTietHoaDon(@Param('maHoaDon') maHoaDon: string) {
    return await this.hoaDonPhongService.getChiTietHoaDon(maHoaDon);
  }

  @Delete(':maHoaDon')
  @ApiOperation({ summary: 'Xóa hóa đơn cá nhân (Soft Delete)' })
  @ApiParam({ name: 'maHoaDon', description: 'Mã hóa đơn (VD: HD-HD01-072026)' })
  async deleteHoaDonPhong(@Param('maHoaDon') maHoaDon: string) {
    return await this.hoaDonPhongService.deleteHoaDonPhong(maHoaDon);
  }

  @Get('quan-ly-chung')
  async getTatCaHoaDonQuanLy(@Query('thangNam') thangNam?: string) {
    return await this.hoaDonPhongService.getAllDanhSachQuanLyHoaDon(thangNam);
  }
}