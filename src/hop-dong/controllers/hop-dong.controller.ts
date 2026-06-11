import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { HopDongService } from '../services/hop-dong.service';
import { CreateHopDongDto } from '../dto/create-hop-dong.dto';
import { UpdateHopDongDto } from '../dto/update-hop-dong.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Hợp Đồng')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hop-dong')
export class HopDongController {
  constructor(private readonly hopDongService: HopDongService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Hợp Đồng mới' })
  create(@Body() dto: CreateHopDongDto) {
    return this.hopDongService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Hợp Đồng' })
  findAll() {
    return this.hopDongService.findAll();
  }

  @Get(':hopDongId')
  @ApiOperation({ summary: 'Chi tiết Hợp Đồng' })
  @ApiParam({ name: 'hopDongId', description: 'ID của Hợp Đồng' })
  findOne(@Param('hopDongId', ParseIntPipe) id: number) {
    return this.hopDongService.findOne(id);
  }

  @Patch(':hopDongId')
  @ApiOperation({ summary: 'Cập nhật Hợp Đồng' })
  update(@Param('hopDongId', ParseIntPipe) id: number, @Body() dto: UpdateHopDongDto) {
    return this.hopDongService.update(id, dto);
  }

  @Delete(':hopDongId')
  @ApiOperation({ summary: 'Xóa Hợp Đồng' })
  remove(@Param('hopDongId', ParseIntPipe) id: number) {
    return this.hopDongService.remove(id);
  }
}
