import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { HoaDonGuiXeService } from '../services/hoa-don-gui-xe.service';
import { CreateHoaDonGuiXeDto } from '../dto/create-hoa-don-gui-xe.dto';
import { UpdateHoaDonGuiXeDto } from '../dto/update-hoa-don-gui-xe.dto';
import { SearchHoaDonGuiXeDto } from '../dto/search-hoa-don-gui-xe.dto';
import { StatisticsHoaDonGuiXeDto } from '../dto/statistics-hoa-don-gui-xe.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Hóa Đơn Gửi Xe')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hoa-don-gui-xe')
export class HoaDonGuiXeController {
  constructor(private readonly hoaDonGuiXeService: HoaDonGuiXeService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Hóa Đơn Gửi Xe mới' })
  create(@Body() dto: CreateHoaDonGuiXeDto) {
    return this.hoaDonGuiXeService.create(dto);
  }

  @Get('getds') 
  @ApiOperation({ summary: 'Danh sách Hóa Đơn Gửi Xe' })
  findAll() {
    return this.hoaDonGuiXeService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm Hóa Đơn Gửi Xe (theo tháng/năm, lọc trạng thái/phương tiện, có phân trang)' })
  search(@Query() dto: SearchHoaDonGuiXeDto) {
    return this.hoaDonGuiXeService.search(dto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Thống kê Hóa Đơn Gửi Xe (tổng doanh thu, số hóa đơn theo tháng)' })
  statistics(@Query() dto: StatisticsHoaDonGuiXeDto) {
    return this.hoaDonGuiXeService.statistics(dto);
  }

  @Get('load-balance')
  @ApiOperation({ summary: 'Lấy 15 phần tử (cuộn tải dần theo id)' })
  @ApiQuery({ name: 'id', required: false, description: 'ID cuối cùng đã tải, bỏ trống để lấy 15 phần tử đầu' })
  getAllLoadingBalance(@Query('id') id?: string) {
    return this.hoaDonGuiXeService.getAllLoadingBalance(id !== undefined ? Number(id) : undefined);
  }

  @Get(':maHoaDon')
  @ApiOperation({ summary: 'Chi tiết Hóa Đơn Gửi Xe' })
  @ApiParam({ name: 'maHoaDon', description: 'ID của Hóa Đơn Gửi Xe' })
  findOne(@Param('maHoaDon', ParseIntPipe) id: number) {
    return this.hoaDonGuiXeService.findOne(id);
  }


  @Delete(':maHoaDon')
  @ApiOperation({ summary: 'Xóa Hóa Đơn Gửi Xe' })
  remove(@Param('maHoaDon', ParseIntPipe) id: number) {
    return this.hoaDonGuiXeService.remove(id);
  }
}
