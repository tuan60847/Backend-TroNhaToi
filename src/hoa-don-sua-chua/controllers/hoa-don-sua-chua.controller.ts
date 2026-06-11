import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { HoaDonSuaChuaService } from '../services/hoa-don-sua-chua.service';
import { CreateHoaDonSuaChuaDto } from '../dto/create-hoa-don-sua-chua.dto';
import { UpdateHoaDonSuaChuaDto } from '../dto/update-hoa-don-sua-chua.dto';
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

  @Get(':maHoaDonSc')
  @ApiOperation({ summary: 'Chi tiết Hóa Đơn Sửa Chữa' })
  @ApiParam({ name: 'maHoaDonSc', description: 'ID của Hóa Đơn Sửa Chữa' })
  findOne(@Param('maHoaDonSc', ParseIntPipe) id: number) {
    return this.hoaDonSuaChuaService.findOne(id);
  }

  @Patch(':maHoaDonSc')
  @ApiOperation({ summary: 'Cập nhật Hóa Đơn Sửa Chữa' })
  update(@Param('maHoaDonSc', ParseIntPipe) id: number, @Body() dto: UpdateHoaDonSuaChuaDto) {
    return this.hoaDonSuaChuaService.update(id, dto);
  }

  @Delete(':maHoaDonSc')
  @ApiOperation({ summary: 'Xóa Hóa Đơn Sửa Chữa' })
  remove(@Param('maHoaDonSc', ParseIntPipe) id: number) {
    return this.hoaDonSuaChuaService.remove(id);
  }
}
