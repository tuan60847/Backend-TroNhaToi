import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { HoaDonTapHoaService } from '../services/hoa-don-tap-hoa.service';
import { CreateHoaDonTapHoaDto } from '../dto/create-hoa-don-tap-hoa.dto';
import { UpdateHoaDonTapHoaDto } from '../dto/update-hoa-don-tap-hoa.dto';
import { SearchHoaDonTapHoaDto } from '../dto/search-hoa-don-tap-hoa.dto';
import { StatisticsHoaDonTapHoaDto } from '../dto/statistics-hoa-don-tap-hoa.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Hóa Đơn Tạp Hóa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hoa-don-tap-hoa')
export class HoaDonTapHoaController {
  constructor(private readonly hoaDonTapHoaService: HoaDonTapHoaService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Hóa Đơn Tạp Hóa mới' })
  create(@Body() dto: CreateHoaDonTapHoaDto) {
    return this.hoaDonTapHoaService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Hóa Đơn Tạp Hóa' })
  findAll() {
    return this.hoaDonTapHoaService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm theo mã hóa đơn tạp hóa (có phân trang)' })
  search(@Query() dto: SearchHoaDonTapHoaDto) {
    return this.hoaDonTapHoaService.search(dto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Thống kê Hóa Đơn Tạp Hóa (tổng doanh thu, số hóa đơn theo tháng)' })
  statistics(@Query() dto: StatisticsHoaDonTapHoaDto) {
    return this.hoaDonTapHoaService.statistics(dto);
  }

  @Get('load-balance')
  @ApiOperation({ summary: 'Lấy 15 phần tử (cuộn tải dần theo id)' })
  @ApiQuery({ name: 'id', required: false, description: 'ID cuối cùng đã tải, bỏ trống để lấy 15 phần tử đầu' })
  getAllLoadingBalance(@Query('id') id?: string) {
    return this.hoaDonTapHoaService.getAllLoadingBalance(id);
  }

  @Get(':maHoaDon')
  @ApiOperation({ summary: 'Chi tiết Hóa Đơn Tạp Hóa' })
  @ApiParam({ name: 'maHoaDon', description: 'ID của Hóa Đơn Tạp Hóa' })
  findOne(@Param('maHoaDon') id: string) {
    return this.hoaDonTapHoaService.findOne(id);
  }

  @Patch(':maHoaDon')
  @ApiOperation({ summary: 'Cập nhật Hóa Đơn Tạp Hóa' })
  update(@Param('maHoaDon') id: string, @Body() dto: UpdateHoaDonTapHoaDto) {
    return this.hoaDonTapHoaService.update(id, dto);
  }

  @Delete(':maHoaDon')
  @ApiOperation({ summary: 'Xóa Hóa Đơn Tạp Hóa' })
  remove(@Param('maHoaDon') id: string) {
    return this.hoaDonTapHoaService.remove(id);
  }
}
