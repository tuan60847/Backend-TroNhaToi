import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PhieuThuHdThService } from '../services/phieu-thu-hdth.service';
import { CreatePhieuThuHdThDto } from '../dto/create-phieu-thu-hdth.dto';
import { UpdatePhieuThuHdThDto } from '../dto/update-phieu-thu-hdth.dto';
import { SearchPhieuThuHdThDto } from '../dto/search-phieu-thu-hdth.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Phiếu Thu HĐ Tạp Hóa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('phieu-thu-hdth')
export class PhieuThuHdThController {
  constructor(private readonly phieuThuHdThService: PhieuThuHdThService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Phiếu Thu HĐ Tạp Hóa mới' })
  create(@Body() dto: CreatePhieuThuHdThDto) {
    return this.phieuThuHdThService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Phiếu Thu HĐ Tạp Hóa' })
  findAll() {
    return this.phieuThuHdThService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm theo mã hóa đơn tạp hóa liên quan (có phân trang)' })
  search(@Query() dto: SearchPhieuThuHdThDto) {
    return this.phieuThuHdThService.search(dto);
  }

  @Get('load-balance')
  @ApiOperation({ summary: 'Lấy 15 phần tử (cuộn tải dần theo id)' })
  @ApiQuery({ name: 'id', required: false, description: 'ID cuối cùng đã tải, bỏ trống để lấy 15 phần tử đầu' })
  getAllLoadingBalance(@Query('id') id?: string) {
    return this.phieuThuHdThService.getAllLoadingBalance(id !== undefined ? Number(id) : undefined);
  }

  @Get(':maPhieuThu')
  @ApiOperation({ summary: 'Chi tiết Phiếu Thu HĐ Tạp Hóa' })
  @ApiParam({ name: 'maPhieuThu', description: 'ID của Phiếu Thu HĐ Tạp Hóa' })
  findOne(@Param('maPhieuThu', ParseIntPipe) id: number) {
    return this.phieuThuHdThService.findOne(id);
  }

  @Patch(':maPhieuThu')
  @ApiOperation({ summary: 'Cập nhật Phiếu Thu HĐ Tạp Hóa' })
  update(@Param('maPhieuThu', ParseIntPipe) id: number, @Body() dto: UpdatePhieuThuHdThDto) {
    return this.phieuThuHdThService.update(id, dto);
  }

  @Delete(':maPhieuThu')
  @ApiOperation({ summary: 'Xóa Phiếu Thu HĐ Tạp Hóa' })
  remove(@Param('maPhieuThu', ParseIntPipe) id: number) {
    return this.phieuThuHdThService.remove(id);
  }

  @Get('hoa-don/:maHoaDon')
  findByMaHoaDon(@Param('maHoaDon') maHoaDon: string) {
    return this.phieuThuHdThService.findByMaHoaDon(maHoaDon);
  }
}
