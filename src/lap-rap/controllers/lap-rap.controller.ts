import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { LapRapService } from '../services/lap-rap.service';
import { CreateLapRapDto } from '../dto/create-lap-rap.dto';
import { UpdateLapRapDto } from '../dto/update-lap-rap.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Lắp Ráp Thiết Bị')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lap-rap')
export class LapRapController {
  constructor(private readonly lapRapService: LapRapService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo Lắp Ráp Thiết Bị mới' })
  create(@Body() dto: CreateLapRapDto) {
    return this.lapRapService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách Lắp Ráp Thiết Bị' })
  findAll() {
    return this.lapRapService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết Lắp Ráp Thiết Bị' })
  @ApiParam({ name: 'id', description: 'ID của Lắp Ráp Thiết Bị' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lapRapService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật Lắp Ráp Thiết Bị' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLapRapDto) {
    return this.lapRapService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa Lắp Ráp Thiết Bị' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lapRapService.remove(id);
  }
}
