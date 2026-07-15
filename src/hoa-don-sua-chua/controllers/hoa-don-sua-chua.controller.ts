import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { HoaDonSuaChuaService } from '../services/hoa-don-sua-chua.service';
import { CreateHoaDonSuaChuaDto } from '../dto/create-hoa-don-sua-chua.dto';
import { UpdateHoaDonSuaChuaDto } from '../dto/update-hoa-don-sua-chua.dto';
import { SearchHoaDonSuaChuaDto } from '../dto/search-hoa-don-sua-chua.dto';
import { UpdateTrangThaiHoaDonSuaChuaDto } from '../dto/update-trang-thai-hoa-don-sua-chua.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Hóa Đơn Sửa Chữa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hoa-don-sua-chua')
export class HoaDonSuaChuaController {
  constructor(private readonly hoaDonSuaChuaService: HoaDonSuaChuaService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Hóa Đơn Sửa Chữa mới' })
  create(@Body() dto: CreateHoaDonSuaChuaDto) {
    return this.hoaDonSuaChuaService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Hóa Đơn Sửa Chữa' })
  findAll() {
    return this.hoaDonSuaChuaService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm Hóa Đơn Sửa Chữa (lọc trạng thái/loại sửa, có phân trang)' })
  search(@Query() dto: SearchHoaDonSuaChuaDto) {
    return this.hoaDonSuaChuaService.search(dto);
  }

  @Get('load-balance')
  @ApiOperation({ summary: 'Lấy 15 phần tử (cuộn tải dần theo mã)' })
  @ApiQuery({ name: 'id', required: false, description: 'Mã hóa đơn cuối cùng đã tải, bỏ trống để lấy 15 phần tử đầu' })
  getAllLoadingBalance(@Query('id') id?: string) {
    return this.hoaDonSuaChuaService.getAllLoadingBalance(id);
  }

  @Get(':maHoaDonSc')
  @ApiOperation({ summary: 'Chi tiết Hóa Đơn Sửa Chữa' })
  @ApiParam({ name: 'maHoaDonSc', description: 'Mã của Hóa Đơn Sửa Chữa' })
  findOne(@Param('maHoaDonSc') id: string) {
    return this.hoaDonSuaChuaService.findOne(id);
  }

  @Patch(':maHoaDonSc')
  @ApiOperation({ summary: 'Cập nhật Hóa Đơn Sửa Chữa' })
  update(@Param('maHoaDonSc') id: string, @Body() dto: UpdateHoaDonSuaChuaDto) {
    return this.hoaDonSuaChuaService.update(id, dto);
  }

  @Patch(':maHoaDonSc/trang-thai')
  @ApiOperation({ summary: 'Cập nhật trạng thái Hóa Đơn Sửa Chữa' })
  @ApiParam({ name: 'maHoaDonSc', description: 'Mã của Hóa Đơn Sửa Chữa' })
  updateTrangThai(@Param('maHoaDonSc') id: string, @Body() dto: UpdateTrangThaiHoaDonSuaChuaDto) {
    return this.hoaDonSuaChuaService.updateTrangThai(id, dto.trangThai);
  }

  @Delete(':maHoaDonSc')
  @ApiOperation({ summary: 'Xóa Hóa Đơn Sửa Chữa' })
  remove(@Param('maHoaDonSc') id: string) {
    return this.hoaDonSuaChuaService.remove(id);
  }
}