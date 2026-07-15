import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PhuongTienService } from '../services/phuong-tien.service';
import { CreatePhuongTienDto } from '../dto/create-phuong-tien.dto';
import { UpdatePhuongTienDto } from '../dto/update-phuong-tien.dto';
import { SearchPhuongTienDto } from '../dto/search-phuong-tien.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Phương Tiện')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('phuong-tien')
export class PhuongTienController {
  constructor(private readonly phuongTienService: PhuongTienService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Phương Tiện mới' })
  create(@Body() dto: CreatePhuongTienDto) {
    return this.phuongTienService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Phương Tiện' })
  findAll() {
    return this.phuongTienService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm theo biển số xe (có phân trang)' })
  search(@Query() dto: SearchPhuongTienDto) {
    return this.phuongTienService.search(dto);
  }

  @Get('load-balance')
  @ApiOperation({ summary: 'Lấy 15 phần tử (cuộn tải dần theo id)' })
  @ApiQuery({ name: 'id', required: false, description: 'ID cuối cùng đã tải, bỏ trống để lấy 15 phần tử đầu' })
  getAllLoadingBalance(@Query('id') id?: string) {
    return this.phuongTienService.getAllLoadingBalance(id !== undefined ? Number(id) : undefined);
  }

  @Get(':bienSo')
  @ApiOperation({ summary: 'Chi tiết Phương Tiện' })
  @ApiParam({ name: 'bienSo', description: 'ID của Phương Tiện' })
  findOne(@Param('bienSo') id: string) {
    return this.phuongTienService.findOne(id);
  }

  @Patch(':bienSo')
  @ApiOperation({ summary: 'Cập nhật Phương Tiện' })
  update(@Param('bienSo') id: string, @Body() dto: UpdatePhuongTienDto) {
    return this.phuongTienService.update(id, dto);
  }

  @Delete(':bienSo')
  @ApiOperation({ summary: 'Xóa Phương Tiện' })
  remove(@Param('bienSo') id: string) {
    return this.phuongTienService.remove(id);
  }
}
