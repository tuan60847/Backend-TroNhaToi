import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PhongService } from '../services/phong.service';
import { CreatePhongDto } from '../dto/create-phong.dto';
import { UpdatePhongDto } from '../dto/update-phong.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Phòng')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('phong')
export class PhongController {
  constructor(private readonly phongService: PhongService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Phòng mới' })
  create(@Body() dto: CreatePhongDto) {
    return this.phongService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Phòng' })
  findAll() {
    return this.phongService.findAll();
  }

  @Get(':phongId')
  @ApiOperation({ summary: 'Chi tiết Phòng' })
  @ApiParam({ name: 'phongId', description: 'ID của Phòng' })
  findOne(@Param('phongId', ParseIntPipe) id: number) {
    return this.phongService.findOne(id);
  }

  @Patch(':phongId')
  @ApiOperation({ summary: 'Cập nhật Phòng' })
  update(@Param('phongId', ParseIntPipe) id: number, @Body() dto: UpdatePhongDto) {
    return this.phongService.update(id, dto);
  }

  @Delete(':phongId')
  @ApiOperation({ summary: 'Xóa Phòng' })
  remove(@Param('phongId', ParseIntPipe) id: number) {
    return this.phongService.remove(id);
  }
}
