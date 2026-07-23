import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NguoiLuuTruTamThoiService } from '../services/nguoi-luu-tru-tam-thoi.service';
import { CreateNguoiLuuTruTamThoiDto } from '../dto/create-nguoi-luu-tru-tam-thoi.dto';
import { UpdateNguoiLuuTruTamThoiDto } from '../dto/update-nguoi-luu-tru-tam-thoi.dto';
import { SearchNguoiLuuTruTamThoiDto } from '../dto/search-nguoi-luu-tru-tam-thoi.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Người Lưu Trú Tạm Thời')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nguoi-luu-tru-tam-thoi')
export class NguoiLuuTruTamThoiController {
  constructor(private readonly nguoiLuuTruTamThoiService: NguoiLuuTruTamThoiService) {}

  @Post()
  @ApiOperation({ summary: 'Thêm người lưu trú tạm thời' })
  create(@Body() dto: CreateNguoiLuuTruTamThoiDto) {
    return this.nguoiLuuTruTamThoiService.taoNguoiLuuTru(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lưu trú (có thể lọc theo idnt)' })
  findAll(@Query('idnt') idnt?: string) {
    return this.nguoiLuuTruTamThoiService.getDanhSachLuuTru(
      idnt ? parseInt(idnt) : undefined,
    );
  }

  @Get(':idtt')
  @ApiOperation({ summary: 'Xem chi tiết lưu trú theo IDTT' })
  findOne(@Param('idtt', ParseIntPipe) idtt: number) {
    return this.nguoiLuuTruTamThoiService.getChiTietLuuTru(idtt);
  }

  @Patch(':idtt')
  @ApiOperation({ summary: 'Cập nhật thông tin người lưu trú' })
  update(
    @Param('idtt', ParseIntPipe) idtt: number,
    @Body() dto: UpdateNguoiLuuTruTamThoiDto,
  ) {
    return this.nguoiLuuTruTamThoiService.capNhatLuuTru(idtt, dto);
  }

  @Delete(':idtt')
  @ApiOperation({ summary: 'Xóa người lưu trú tạm thời' })
  remove(@Param('idtt', ParseIntPipe) idtt: number) {
    return this.nguoiLuuTruTamThoiService.xoaLuuTru(idtt);
  }
}
