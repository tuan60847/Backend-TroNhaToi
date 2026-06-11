import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { HoaDonGuiXeService } from '../services/hoa-don-gui-xe.service';
import { CreateHoaDonGuiXeDto } from '../dto/create-hoa-don-gui-xe.dto';
import { UpdateHoaDonGuiXeDto } from '../dto/update-hoa-don-gui-xe.dto';
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

  @Get()
  @ApiOperation({ summary: 'Danh sách Hóa Đơn Gửi Xe' })
  findAll() {
    return this.hoaDonGuiXeService.findAll();
  }

  @Get(':maHoaDon')
  @ApiOperation({ summary: 'Chi tiết Hóa Đơn Gửi Xe' })
  @ApiParam({ name: 'maHoaDon', description: 'ID của Hóa Đơn Gửi Xe' })
  findOne(@Param('maHoaDon', ParseIntPipe) id: number) {
    return this.hoaDonGuiXeService.findOne(id);
  }

  @Patch(':maHoaDon')
  @ApiOperation({ summary: 'Cập nhật Hóa Đơn Gửi Xe' })
  update(@Param('maHoaDon', ParseIntPipe) id: number, @Body() dto: UpdateHoaDonGuiXeDto) {
    return this.hoaDonGuiXeService.update(id, dto);
  }

  @Delete(':maHoaDon')
  @ApiOperation({ summary: 'Xóa Hóa Đơn Gửi Xe' })
  remove(@Param('maHoaDon', ParseIntPipe) id: number) {
    return this.hoaDonGuiXeService.remove(id);
  }
}
