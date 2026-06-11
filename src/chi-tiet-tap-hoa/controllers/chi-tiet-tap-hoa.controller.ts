import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ChiTietTapHoaService } from '../services/chi-tiet-tap-hoa.service';
import { CreateChiTietTapHoaDto } from '../dto/create-chi-tiet-tap-hoa.dto';
import { UpdateChiTietTapHoaDto } from '../dto/update-chi-tiet-tap-hoa.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Chi Tiết Tạp Hóa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chi-tiet-tap-hoa')
export class ChiTietTapHoaController {
  constructor(private readonly chiTietTapHoaService: ChiTietTapHoaService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Chi Tiết Tạp Hóa mới' })
  create(@Body() dto: CreateChiTietTapHoaDto) {
    return this.chiTietTapHoaService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Chi Tiết Tạp Hóa' })
  findAll() {
    return this.chiTietTapHoaService.findAll();
  }

  @Get(':maChiTietHoaDon')
  @ApiOperation({ summary: 'Chi tiết Chi Tiết Tạp Hóa' })
  @ApiParam({ name: 'maChiTietHoaDon', description: 'ID của Chi Tiết Tạp Hóa' })
  findOne(@Param('maChiTietHoaDon', ParseIntPipe) id: number) {
    return this.chiTietTapHoaService.findOne(id);
  }

  @Patch(':maChiTietHoaDon')
  @ApiOperation({ summary: 'Cập nhật Chi Tiết Tạp Hóa' })
  update(@Param('maChiTietHoaDon', ParseIntPipe) id: number, @Body() dto: UpdateChiTietTapHoaDto) {
    return this.chiTietTapHoaService.update(id, dto);
  }

  @Delete(':maChiTietHoaDon')
  @ApiOperation({ summary: 'Xóa Chi Tiết Tạp Hóa' })
  remove(@Param('maChiTietHoaDon', ParseIntPipe) id: number) {
    return this.chiTietTapHoaService.remove(id);
  }
}
