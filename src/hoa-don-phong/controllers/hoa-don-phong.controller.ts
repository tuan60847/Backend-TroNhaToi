import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { HoaDonPhongService } from '../services/hoa-don-phong.service';
import { CreateHoaDonPhongDto } from '../dto/create-hoa-don-phong.dto';
import { UpdateHoaDonPhongDto } from '../dto/update-hoa-don-phong.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Hóa Đơn Phòng')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hoa-don-phong')
export class HoaDonPhongController {
  constructor(private readonly hoaDonPhongService: HoaDonPhongService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Hóa Đơn Phòng mới' })
  create(@Body() dto: CreateHoaDonPhongDto) {
    return this.hoaDonPhongService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Hóa Đơn Phòng' })
  findAll() {
    return this.hoaDonPhongService.findAll();
  }

  @Get(':maHoaDon')
  @ApiOperation({ summary: 'Chi tiết Hóa Đơn Phòng' })
  @ApiParam({ name: 'maHoaDon', description: 'ID của Hóa Đơn Phòng' })
  findOne(@Param('maHoaDon', ParseIntPipe) id: number) {
    return this.hoaDonPhongService.findOne(id);
  }

  @Patch(':maHoaDon')
  @ApiOperation({ summary: 'Cập nhật Hóa Đơn Phòng' })
  update(@Param('maHoaDon', ParseIntPipe) id: number, @Body() dto: UpdateHoaDonPhongDto) {
    return this.hoaDonPhongService.update(id, dto);
  }

  @Delete(':maHoaDon')
  @ApiOperation({ summary: 'Xóa Hóa Đơn Phòng' })
  remove(@Param('maHoaDon', ParseIntPipe) id: number) {
    return this.hoaDonPhongService.remove(id);
  }
}
