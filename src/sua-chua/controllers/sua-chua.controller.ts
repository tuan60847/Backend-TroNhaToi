import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SuaChuaService } from '../services/sua-chua.service';
import { CreateSuaChuaDto } from '../dto/create-sua-chua.dto';
import { UpdateSuaChuaDto } from '../dto/update-sua-chua.dto';
import { SearchSuaChuaDto } from '../dto/search-sua-chua.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Sửa Chữa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sua-chua')
export class SuaChuaController {
  constructor(private readonly suaChuaService: SuaChuaService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Sửa Chữa mới' })
  create(@Body() dto: CreateSuaChuaDto) {
    return this.suaChuaService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Sửa Chữa' })
  findAll() {
    return this.suaChuaService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm Sửa Chữa (theo nguyên nhân, lọc phòng/thiết bị, có phân trang)' })
  search(@Query() dto: SearchSuaChuaDto) {
    return this.suaChuaService.search(dto);
  }

  @Get('load-balance')
  @ApiOperation({ summary: 'Lấy 15 phần tử (cuộn tải dần theo id)' })
  @ApiQuery({ name: 'id', required: false, description: 'ID cuối cùng đã tải, bỏ trống để lấy 15 phần tử đầu' })
  getAllLoadingBalance(@Query('id') id?: string) {
    return this.suaChuaService.getAllLoadingBalance(id !== undefined ? Number(id) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết Sửa Chữa' })
  @ApiParam({ name: 'id', description: 'ID của Sửa Chữa' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.suaChuaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật Sửa Chữa' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSuaChuaDto) {
    return this.suaChuaService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa Sửa Chữa' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.suaChuaService.remove(id);
  }

  @Get('thiet-bi/:thietBiId')
  async getByThietBiId(
    @Param('thietBiId', ParseIntPipe) thietBiId: number,
  ) {
    return this.suaChuaService.getByThietBi(thietBiId);
  }
}
