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
  @ApiOperation({ summary: 'Tạo Người Lưu Trú Tạm Thời mới' })
  create(@Body() dto: CreateNguoiLuuTruTamThoiDto) {
    return this.nguoiLuuTruTamThoiService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Người Lưu Trú Tạm Thời' })
  findAll() {
    return this.nguoiLuuTruTamThoiService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm Người Lưu Trú Tạm Thời (theo họ tên/CCCD/SĐT/quê quán, có phân trang)' })
  search(@Query() dto: SearchNguoiLuuTruTamThoiDto) {
    return this.nguoiLuuTruTamThoiService.search(dto);
  }

  @Get('search-by-name')
  @ApiOperation({ summary: 'Tìm kiếm Người Lưu Trú Tạm Thời theo tên' })
  @ApiQuery({ name: 'ten', required: true, description: 'Tên cần tìm' })
  searchByName(@Query('ten') ten: string) {
    return this.nguoiLuuTruTamThoiService.searchByName(ten);
  }

  @Get('load-balance')
  @ApiOperation({ summary: 'Lấy 15 phần tử (cuộn tải dần theo id)' })
  @ApiQuery({ name: 'id', required: false, description: 'ID cuối cùng đã tải, bỏ trống để lấy 15 phần tử đầu' })
  getAllLoadingBalance(@Query('id') id?: string) {
    return this.nguoiLuuTruTamThoiService.getAllLoadingBalance(id !== undefined ? Number(id) : undefined);
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
