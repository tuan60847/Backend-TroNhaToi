import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ThietBiService } from '../services/thiet-bi.service';
import { CreateThietBiDto } from '../dto/create-thiet-bi.dto';
import { UpdateThietBiDto } from '../dto/update-thiet-bi.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Thiết Bị')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('thiet-bi')
export class ThietBiController {
  constructor(private readonly thietBiService: ThietBiService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Thiết Bị mới' })
  create(@Body() dto: CreateThietBiDto) {
    return this.thietBiService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Thiết Bị' })
  findAll() {
    return this.thietBiService.findAll();
  }

  @Get(':thietBiId')
  @ApiOperation({ summary: 'Chi tiết Thiết Bị' })
  @ApiParam({ name: 'thietBiId', description: 'ID của Thiết Bị' })
  findOne(@Param('thietBiId', ParseIntPipe) id: number) {
    return this.thietBiService.findOne(id);
  }

  @Patch(':thietBiId')
  @ApiOperation({ summary: 'Cập nhật Thiết Bị' })
  update(@Param('thietBiId', ParseIntPipe) id: number, @Body() dto: UpdateThietBiDto) {
    return this.thietBiService.update(id, dto);
  }

  @Delete(':thietBiId')
  @ApiOperation({ summary: 'Xóa Thiết Bị' })
  remove(@Param('thietBiId', ParseIntPipe) id: number) {
    return this.thietBiService.remove(id);
  }
}
