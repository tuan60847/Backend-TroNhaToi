import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PhieuThuHangThangService } from '../services/phieu-thu-hang-thang.service';
import { CreatePhieuThuHangThangDto } from '../dto/create-phieu-thu-hang-thang.dto';
import { UpdatePhieuThuHangThangDto } from '../dto/update-phieu-thu-hang-thang.dto';
import { SearchPhieuThuHangThangDto } from '../dto/search-phieu-thu-hang-thang.dto';
import { StatisticsPhieuThuHangThangDto } from '../dto/statistics-phieu-thu-hang-thang.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Phiếu Thu Hàng Tháng')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('phieu-thu-hang-thang')
export class PhieuThuHangThangController {
  constructor(private readonly phieuThuHangThangService: PhieuThuHangThangService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Phiếu Thu Hàng Tháng mới' })
  create(@Body() dto: CreatePhieuThuHangThangDto) {
    return this.phieuThuHangThangService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Phiếu Thu Hàng Tháng' })
  findAll() {
    return this.phieuThuHangThangService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm theo mã hóa đơn phòng liên quan (có phân trang)' })
  search(@Query() dto: SearchPhieuThuHangThangDto) {
    return this.phieuThuHangThangService.search(dto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Thống kê Phiếu Thu Hàng Tháng (tổng tiền đã thu, số phiếu theo tháng)' })
  statistics(@Query() dto: StatisticsPhieuThuHangThangDto) {
    return this.phieuThuHangThangService.statistics(dto);
  }

  @Get('load-balance')
  @ApiOperation({ summary: 'Lấy 15 phần tử (cuộn tải dần theo id)' })
  @ApiQuery({ name: 'id', required: false, description: 'ID cuối cùng đã tải, bỏ trống để lấy 15 phần tử đầu' })
  getAllLoadingBalance(@Query('id') id?: string) {
    return this.phieuThuHangThangService.getAllLoadingBalance(id !== undefined ? Number(id) : undefined);
  }

  @Get(':maPhieuThu')
  @ApiOperation({ summary: 'Chi tiết Phiếu Thu Hàng Tháng' })
  @ApiParam({ name: 'maPhieuThu', description: 'ID của Phiếu Thu Hàng Tháng' })
  findOne(@Param('maPhieuThu', ParseIntPipe) id: number) {
    return this.phieuThuHangThangService.findOne(id);
  }

  @Patch(':maPhieuThu')
  @ApiOperation({ summary: 'Cập nhật Phiếu Thu Hàng Tháng' })
  update(@Param('maPhieuThu', ParseIntPipe) id: number, @Body() dto: UpdatePhieuThuHangThangDto) {
    return this.phieuThuHangThangService.update(id, dto);
  }

  @Delete(':maPhieuThu')
  @ApiOperation({ summary: 'Xóa Phiếu Thu Hàng Tháng' })
  remove(@Param('maPhieuThu', ParseIntPipe) id: number) {
    return this.phieuThuHangThangService.remove(id);
  }
}
