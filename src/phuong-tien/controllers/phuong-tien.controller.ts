import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Thêm mới phương tiện' })
  create(@Body() createDto: CreatePhuongTienDto) {
    return this.phuongTienService.create(createDto);
  }

  @Get('nguoi-thue/:idnt')
  @ApiOperation({ summary: 'Danh sách Phương Tiện theo id người thuê' })
  @ApiParam({ name: 'idnt', description: 'ID Người Thuê' })
  findAll(@Param('idnt', ParseIntPipe) idnt: number) {
    return this.phuongTienService.findByNguoiThue(idnt);
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

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin phương tiện' })
  @ApiParam({ name: 'id', description: 'ID phương tiện' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePhuongTienDto,
  ) {
    return this.phuongTienService.update(id, updateDto);
  }

@Delete(':id')
  @ApiOperation({ summary: 'Xóa phương tiện' })
  @ApiParam({ name: 'id', description: 'ID phương tiện cần xóa' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.phuongTienService.remove(id);
  }
 }
