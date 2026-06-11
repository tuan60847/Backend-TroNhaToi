import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PhieuThuHdThService } from '../services/phieu-thu-hdth.service';
import { CreatePhieuThuHdThDto } from '../dto/create-phieu-thu-hdth.dto';
import { UpdatePhieuThuHdThDto } from '../dto/update-phieu-thu-hdth.dto';
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
}
