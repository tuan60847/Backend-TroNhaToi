import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { HoaDonTapHoaService } from '../services/hoa-don-tap-hoa.service';
import { CreateHoaDonTapHoaDto } from '../dto/create-hoa-don-tap-hoa.dto';
import { UpdateHoaDonTapHoaDto } from '../dto/update-hoa-don-tap-hoa.dto';
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

  @Get(':maHoaDon')
  @ApiOperation({ summary: 'Chi tiết Hóa Đơn Tạp Hóa' })
  @ApiParam({ name: 'maHoaDon', description: 'ID của Hóa Đơn Tạp Hóa' })
  findOne(@Param('maHoaDon', ParseIntPipe) id: number) {
    return this.hoaDonTapHoaService.findOne(id);
  }

  @Patch(':maHoaDon')
  @ApiOperation({ summary: 'Cập nhật Hóa Đơn Tạp Hóa' })
  update(@Param('maHoaDon', ParseIntPipe) id: number, @Body() dto: UpdateHoaDonTapHoaDto) {
    return this.hoaDonTapHoaService.update(id, dto);
  }

  @Delete(':maHoaDon')
  @ApiOperation({ summary: 'Xóa Hóa Đơn Tạp Hóa' })
  remove(@Param('maHoaDon', ParseIntPipe) id: number) {
    return this.hoaDonTapHoaService.remove(id);
  }
}
