import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Put } from '@nestjs/common';
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

  @Post('createLoaiPhong')
  async create(@Body() dto: CreateLoaiPhongDto) {
    return await this.loaiPhongService.create(dto);
  }

  @Get('getAllLoaiPhong')
  @ApiOperation({ summary: 'Danh sách Loại Phòng' })
  findAll() {
    return this.loaiPhongService.findAll();
  }

   @Put('updateLoaiPhong')
  async update(@Body() dto: UpdateLoaiPhongDto) {
    return await this.loaiPhongService.update(dto);
  }
  @Delete('deleteLoaiPhong/:id')
  @ApiOperation({ summary: 'Xóa Loại Phòng' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.loaiPhongService.remove(id);
  }

  @Get(':maLoaiPhong')
  @ApiOperation({ summary: 'Chi tiết Loại Phòng' })
  @ApiParam({ name: 'maLoaiPhong', description: 'ID của Loại Phòng' })
  findOne(@Param('maLoaiPhong', ParseIntPipe) id: number) {
    return this.loaiPhongService.findOne(id);
  }
}
