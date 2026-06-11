import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { NguoiLuuTruTamThoiService } from '../services/nguoi-luu-tru-tam-thoi.service';
import { CreateNguoiLuuTruTamThoiDto } from '../dto/create-nguoi-luu-tru-tam-thoi.dto';
import { UpdateNguoiLuuTruTamThoiDto } from '../dto/update-nguoi-luu-tru-tam-thoi.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Người Lưu Trú Tạm Thời')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nguoi-luu-tru-tam-thoi')
export class NguoiLuuTruTamThoiController {
  constructor(private readonly nguoiLuuTruTamThoiService: NguoiLuuTruTamThoiService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Người Lưu Trú Tạm Thời mới' })
  create(@Body() dto: CreateNguoiLuuTruTamThoiDto) {
    return this.nguoiLuuTruTamThoiService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Người Lưu Trú Tạm Thời' })
  findAll() {
    return this.nguoiLuuTruTamThoiService.findAll();
  }

  @Get(':idtt')
  @ApiOperation({ summary: 'Chi tiết Người Lưu Trú Tạm Thời' })
  @ApiParam({ name: 'idtt', description: 'ID của Người Lưu Trú Tạm Thời' })
  findOne(@Param('idtt', ParseIntPipe) id: number) {
    return this.nguoiLuuTruTamThoiService.findOne(id);
  }

  @Patch(':idtt')
  @ApiOperation({ summary: 'Cập nhật Người Lưu Trú Tạm Thời' })
  update(@Param('idtt', ParseIntPipe) id: number, @Body() dto: UpdateNguoiLuuTruTamThoiDto) {
    return this.nguoiLuuTruTamThoiService.update(id, dto);
  }

  @Delete(':idtt')
  @ApiOperation({ summary: 'Xóa Người Lưu Trú Tạm Thời' })
  remove(@Param('idtt', ParseIntPipe) id: number) {
    return this.nguoiLuuTruTamThoiService.remove(id);
  }
}
