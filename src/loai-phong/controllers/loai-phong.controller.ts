import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LoaiPhongService } from '../services/loai-phong.service';
import { CreateLoaiPhongDto } from '../dto/create-loai-phong.dto';
import { UpdateLoaiPhongDto } from '../dto/update-loai-phong.dto';
import { SearchLoaiPhongDto } from '../dto/search-loai-phong.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Loại Phòng')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loai-phong')
export class LoaiPhongController {
  constructor(private readonly loaiPhongService: LoaiPhongService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Loại Phòng mới' })
  create(@Body() dto: CreateLoaiPhongDto) {
    return this.loaiPhongService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Loại Phòng' })
  findAll() {
    return this.loaiPhongService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm Loại Phòng (theo tên, có phân trang)' })
  search(@Query() dto: SearchLoaiPhongDto) {
    return this.loaiPhongService.search(dto);
  }

  @Get('search-by-name')
  @ApiOperation({ summary: 'Tìm kiếm Loại Phòng theo tên' })
  @ApiQuery({ name: 'ten', required: true, description: 'Tên cần tìm' })
  searchByName(@Query('ten') ten: string) {
    return this.loaiPhongService.searchByName(ten);
  }

  @Get('load-balance')
  @ApiOperation({ summary: 'Lấy 15 phần tử (cuộn tải dần theo id)' })
  @ApiQuery({ name: 'id', required: false, description: 'ID cuối cùng đã tải, bỏ trống để lấy 15 phần tử đầu' })
  getAllLoadingBalance(@Query('id') id?: string) {
    return this.loaiPhongService.getAllLoadingBalance(id !== undefined ? Number(id) : undefined);
  }

  @Get(':maLoaiPhong')
  @ApiOperation({ summary: 'Chi tiết Loại Phòng' })
  @ApiParam({ name: 'maLoaiPhong', description: 'ID của Loại Phòng' })
  findOne(@Param('maLoaiPhong', ParseIntPipe) id: number) {
    return this.loaiPhongService.findOne(id);
  }

  @Patch(':maLoaiPhong')
  @ApiOperation({ summary: 'Cập nhật Loại Phòng' })
  update(@Param('maLoaiPhong', ParseIntPipe) id: number, @Body() dto: UpdateLoaiPhongDto) {
    return this.loaiPhongService.update(id, dto);
  }

  @Delete(':maLoaiPhong')
  @ApiOperation({ summary: 'Xóa Loại Phòng' })
  remove(@Param('maLoaiPhong', ParseIntPipe) id: number) {
    return this.loaiPhongService.remove(id);
  }
}
