import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PhuongTienService } from '../services/phuong-tien.service';
import { CreatePhuongTienDto } from '../dto/create-phuong-tien.dto';
import { UpdatePhuongTienDto } from '../dto/update-phuong-tien.dto';
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
