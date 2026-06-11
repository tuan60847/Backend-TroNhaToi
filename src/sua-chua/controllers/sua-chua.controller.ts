import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SuaChuaService } from '../services/sua-chua.service';
import { CreateSuaChuaDto } from '../dto/create-sua-chua.dto';
import { UpdateSuaChuaDto } from '../dto/update-sua-chua.dto';
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
}
