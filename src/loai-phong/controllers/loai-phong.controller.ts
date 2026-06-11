import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { LoaiPhongService } from '../services/loai-phong.service';
import { CreateLoaiPhongDto } from '../dto/create-loai-phong.dto';
import { UpdateLoaiPhongDto } from '../dto/update-loai-phong.dto';
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
